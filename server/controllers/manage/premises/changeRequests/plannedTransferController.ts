import type { Request, RequestHandler, Response } from 'express'
import { TransferFormData } from '@approved-premises/ui'
import { Params } from 'static-path'
import { Cas1NewChangeRequest, Unit } from '@approved-premises/api'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'
import { PlacementRequestService, PlacementService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import { getAppealReasonId, mapChangeRequestReasonsToRadios } from '../../../../utils/placements/changeRequests'
import { convertObjectsToRadioItems } from '../../../../utils/formUtils'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import {
  plannedTransferSuccessMessage,
  plannedTransferSummaryList,
  validateNew,
} from '../../../../utils/placements/transfers'

export default class PlannedTransfersController {
  formData: MultiPageFormManager<'transfers'>

  constructor(
    private readonly placementService: PlacementService,
    private readonly placementRequestService: PlacementRequestService,
  ) {
    this.formData = new MultiPageFormManager('transfers')
  }

  details(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const placement = await this.placementService.getPlacement(token, placementId)
      const transferReasons = await this.placementRequestService.getChangeRequestReasons(
        req.user.token,
        'plannedTransfer',
      )

      const formData = this.formData.get(placementId, req.session) || {}
      const transferReasonRadioItems = mapChangeRequestReasonsToRadios(transferReasons, 'transferReason', formData)

      const isFlexibleRadioItems = convertObjectsToRadioItems(
        [
          { name: 'Yes', id: 'yes' },
          { name: 'No', id: 'no' },
        ],
        'name',
        'id',
        'isFlexible',
        formData,
      )

      try {
        validateNew(req, res, formData)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, error.redirect)
      }

      return res.render('manage/premises/placements/transfers/planned-details', {
        backlink: managePaths.premises.placements.transfers.new({ premisesId, placementId }),
        pageHeading: 'Enter the transfer details',
        placement,
        transferReasonRadioItems,
        isFlexibleRadioItems,
        ...fetchErrorsAndUserInput(req),
        ...formData,
      })
    }
  }

  private validatePlannedDetails(req: Request, res: Response, body: TransferFormData = {}): void {
    const errors: Record<string, string> = {}
    if (!body.isFlexible) {
      errors.isFlexible = 'You must indicate if the transfer date is flexible'
    }
    if (!body.transferReason) {
      errors.transferReason = 'You must choose a reason for the transfer'
    }
    if (!body.notes) {
      errors.notes = 'You must give the details of the transfer'
    }

    if (Object.keys(errors).length) {
      throw new ValidationError(
        errors,
        managePaths.premises.placements.transfers.plannedDetails(req.params as Params<string>),
      )
    }

    return undefined
  }

  detailsSave(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)

      try {
        await this.formData.update(placementId, req.session, {
          ...req.body,
        })
        validateNew(req, res, formData)
        this.validatePlannedDetails(req, res, req.body)

        return res.redirect(managePaths.premises.placements.transfers.plannedConfirm({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect ||
            managePaths.premises.placements.transfers.plannedDetails({
              premisesId,
              placementId,
            }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      try {
        validateNew(req, res, formData)
        this.validatePlannedDetails(req, res, formData)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, error.redirect)
      }

      return res.render('manage/premises/placements/transfers/confirm', {
        backlink: managePaths.premises.placements.transfers.plannedDetails({ premisesId, placementId }),
        pageHeading: 'Confirm transfer request',
        placement,
        summaryList: plannedTransferSummaryList(formData),
        ...fetchErrorsAndUserInput(req),
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const transferReasons = await this.placementRequestService.getChangeRequestReasons(
        req.user.token,
        'plannedTransfer',
      )

      try {
        validateNew(req, res, formData)
        this.validatePlannedDetails(req, res, formData)
        const { isFlexible, transferReason, transferDate, notes } = formData
        const transferJson = {
          transferDate,
          isFlexible,
          transferReason,
          notes,
        }
        const newPlannedTransfer: Cas1NewChangeRequest = {
          spaceBookingId: placementId,
          type: 'plannedTransfer',
          reasonId: getAppealReasonId(formData.transferReason, transferReasons),
          requestJson: JSON.stringify(transferJson) as unknown as Unit,
        }

        await this.placementRequestService.createPlannedTransfer(
          req.user.token,
          placement.placementRequestId,
          newPlannedTransfer,
        )
        await this.formData.remove(placementId, req.session)
        req.flash('success', plannedTransferSuccessMessage)

        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect || managePaths.premises.placements.transfers.plannedConfirm({ premisesId, placementId }),
        )
      }
    }
  }
}
