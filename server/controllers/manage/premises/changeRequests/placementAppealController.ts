import type { Request, RequestHandler, Response } from 'express'

import { AppealJson, AppealFormData, ObjectWithDateParts } from '@approved-premises/ui'
import { Cas1NewChangeRequest, Unit } from '@approved-premises/api'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import { PlacementRequestService, PremisesService } from '../../../../services'
import {
  mapChangeRequestReasonsToRadios,
  getAppealReasonId,
  validateNewAppealResponse,
  getConfirmationSummary,
} from '../../../../utils/placements/changeRequests'
import managePaths from '../../../../paths/manage'
import { DateFormats } from '../../../../utils/dateUtils'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'

export default class PlacementAppealController {
  formData: MultiPageFormManager<'appeals'>

  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementRequestService: PlacementRequestService,
  ) {
    this.formData = new MultiPageFormManager('appeals')
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const context = { ...this.formData.get(placementId, req.session), ...fetchErrorsAndUserInput(req) }

      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })
      const appealReasons = await this.placementRequestService.getChangeRequestReasons(
        req.user.token,
        'placementAppeal',
      )
      const appealReasonRadioItems = mapChangeRequestReasonsToRadios(appealReasons, 'appealReason', context)

      return res.render('manage/premises/placements/appeals/new', {
        pageHeading: 'Request an appeal against a placement',
        postUrl: managePaths.premises.placements.appeal.new({ premisesId, placementId }),
        placement,
        appealReasonRadioItems,
        ...context,
      })
    }
  }

  newSave(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { body } = req as { body: AppealFormData }
      try {
        await this.formData.update(placementId, req.session, body)
        validateNewAppealResponse(body)
        return res.redirect(managePaths.premises.placements.appeal.confirm({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.appeal.new({ premisesId, placementId }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const sessionData = this.formData.get(placementId, req.session)

      try {
        validateNewAppealResponse(sessionData)
        const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

        return res.render('manage/premises/placements/appeals/confirm', {
          pageHeading: 'Confirm the appeal details',
          postUrl: managePaths.premises.placements.appeal.confirm({ premisesId, placementId }),
          backLink: managePaths.premises.placements.appeal.new({ premisesId, placementId }),
          placement,
          summaryList: { rows: getConfirmationSummary(sessionData) },
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.appeal.new({ premisesId, placementId }),
        )
      }
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const sessionData = this.formData.get(placementId, req.session)
      try {
        validateNewAppealResponse(sessionData)
        const appealReasons = await this.placementRequestService.getChangeRequestReasons(
          req.user.token,
          'placementAppeal',
        )
        const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

        const { areaManagerName, areaManagerEmail, appealReason, notes } = sessionData
        const reasonId = getAppealReasonId(appealReason, appealReasons)

        const { approvalDate } = DateFormats.dateAndTimeInputsToIsoString(
          sessionData as ObjectWithDateParts<'approvalDate'>,
          'approvalDate',
        )
        const reasonDetailKey: keyof AppealJson<string> = `${appealReason}Detail`

        const requestJson: AppealJson<string> = {
          areaManagerName,
          areaManagerEmail,
          appealReason,
          approvalDate,
          notes,
          [reasonDetailKey]: sessionData[reasonDetailKey],
        }

        const newChangeRequest: Cas1NewChangeRequest = {
          spaceBookingId: placementId,
          type: 'placementAppeal',
          reasonId,
          requestJson: JSON.stringify(requestJson) as unknown as Unit,
        }

        await this.placementRequestService.createPlacementAppeal(
          req.user.token,
          placement.placementRequestId,
          newChangeRequest,
        )

        await this.formData.remove(placementId, req.session)
        req.flash('success', {
          heading: 'You have appealed this placement',
          body: `<p>This placement will remain visible under the 'Upcoming' tab until your appeal is progressed by the CRU.</p>`,
        })

        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.appeal.new({ premisesId, placementId }),
        )
      }
    }
  }
}
