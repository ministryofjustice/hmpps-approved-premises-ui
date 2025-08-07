import type { Request, RequestHandler, Response } from 'express'
import { addDays, isBefore } from 'date-fns'
import { TransferFormData } from '@approved-premises/ui'
import { Cas1NewEmergencyTransfer } from '@approved-premises/api'
import { Params } from 'static-path'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import { dateAndTimeInputsAreValidDates, DateFormats } from '../../../../utils/dateUtils'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'
import {
  allApprovedPremisesOptions,
  emergencyTransferSummaryList,
  validateNew,
} from '../../../../utils/placements/transfers'
import { placementKeyDetails } from '../../../../utils/placements'

export default class TransfersController {
  formData: MultiPageFormManager<'transfers'>

  constructor(
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
  ) {
    this.formData = new MultiPageFormManager('transfers')
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      return res.render('manage/premises/placements/transfers/new', {
        backlink: managePaths.premises.placements.show({ premisesId, placementId }),
        pageHeading: 'Request a transfer',
        contextKeyDetails: placementKeyDetails(placement),
        errors,
        errorSummary,
        ...formData,
        ...userInput,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        req.body.transferDate = DateFormats.dateAndTimeInputsToIsoString(req.body, 'transferDate').transferDate
        validateNew(req, res, req.body)
        await this.formData.update(placementId, req.session, req.body)

        const tomorrow = DateFormats.dateObjToIsoDate(addDays(new Date(), 1))
        const { transferDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'transferDate')
        if (isBefore(transferDate, tomorrow)) {
          return res.redirect(managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }))
        }
        return res.redirect(managePaths.premises.placements.transfers.plannedDetails({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect ||
            managePaths.premises.placements.transfers.new({
              premisesId,
              placementId,
            }),
        )
      }
    }
  }

  details(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(token, placementId)
      const approvedPremises = await this.premisesService.getCas1All(token)

      const formData = this.formData.get(placementId, req.session)

      try {
        validateNew(req, res, formData)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, error.redirect)
      }

      return res.render('manage/premises/placements/transfers/emergency-details', {
        backlink: managePaths.premises.placements.transfers.new({ premisesId, placementId }),
        pageHeading: 'Enter the emergency transfer details',
        contextKeyDetails: placementKeyDetails(placement),
        placement,
        approvedPremisesOptions: allApprovedPremisesOptions(approvedPremises),
        errors,
        errorSummary,
        ...formData,
        ...userInput,
      })
    }
  }

  private validateDetails(req: Request, body: TransferFormData = {}): void {
    const errors: Record<string, string> = {}

    if (!body.destinationPremisesId) {
      errors.destinationPremisesId = 'You must select an Approved Premises for the person to be transferred to'
    }

    const { placementEndDate } = body

    if (!placementEndDate) {
      errors.placementEndDate = 'You must enter a placement end date'
    } else if (!dateAndTimeInputsAreValidDates(body, 'placementEndDate')) {
      errors.placementEndDate = 'You must enter a valid placement end date'
    } else {
      const { transferDate } = DateFormats.dateAndTimeInputsToIsoString(
        this.formData.get(req.params.placementId, req.session),
        'transferDate',
      )

      if (isBefore(placementEndDate, transferDate) || placementEndDate === transferDate) {
        errors.placementEndDate = `The placement end date must be after the transfer date, ${DateFormats.isoDateToUIDate(transferDate, { format: 'short' })}`
      }
    }

    if (Object.keys(errors).length) {
      throw new ValidationError(
        errors,
        managePaths.premises.placements.transfers.emergencyDetails(req.params as Params<string>),
      )
    }

    return undefined
  }

  saveDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)

      try {
        validateNew(req, res, formData)

        req.body.placementEndDate = DateFormats.dateAndTimeInputsToIsoString(
          req.body,
          'placementEndDate',
        ).placementEndDate

        this.validateDetails(req, req.body)

        const destinationPremises = await this.premisesService.find(req.user.token, req.body.destinationPremisesId)

        await this.formData.update(placementId, req.session, {
          ...req.body,
          destinationPremisesName: destinationPremises.name,
        })

        return res.redirect(managePaths.premises.placements.transfers.emergencyConfirm({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect ||
            managePaths.premises.placements.transfers.emergencyDetails({
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
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      try {
        validateNew(req, res, formData)
        this.validateDetails(req, formData)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, error.redirect)
      }

      return res.render('manage/premises/placements/transfers/confirm', {
        backlink: managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }),
        pageHeading: 'Confirm emergency transfer',
        contextKeyDetails: placementKeyDetails(placement),
        summaryList: emergencyTransferSummaryList(formData),
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)

      try {
        validateNew(req, res, formData)
        this.validateDetails(req, formData)

        const newEmergencyTransfer: Cas1NewEmergencyTransfer = {
          arrivalDate: formData.transferDate,
          departureDate: formData.placementEndDate,
          destinationPremisesId: formData.destinationPremisesId,
        }

        await this.placementService.createEmergencyTransfer(
          req.user.token,
          premisesId,
          placementId,
          newEmergencyTransfer,
        )

        await this.formData.remove(placementId, req.session)

        req.flash('success', {
          heading: 'Emergency transfer recorded',
          body: '<p>You must now record the person as departed, and use the move-on category for transfer.</p>',
        })

        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect || managePaths.premises.placements.transfers.emergencyConfirm({ premisesId, placementId }),
        )
      }
    }
  }
}
