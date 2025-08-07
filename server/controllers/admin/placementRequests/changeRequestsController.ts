import type { Request, Response, TypedRequestHandler } from 'express'

import {
  Cas1ApprovedPlacementAppeal,
  Cas1ChangeRequest,
  Cas1PlacementRequestDetail,
  Cas1RejectChangeRequest,
  Cas1SpaceBooking,
  NamedId,
} from '@approved-premises/api'
import { ValidationError } from '../../../utils/errors'
import { PlacementRequestService, PlacementService } from '../../../services'
import paths from '../../../paths/admin'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { changeRequestSummaryList } from '../../../utils/placementRequests/changeRequestSummaryList'
import { DateFormats } from '../../../utils/dateUtils'
import { getChangeRequestReasonId, mapChangeRequestReasonsToRadios } from '../../../utils/placements/changeRequests'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'

type AppealDecision = 'progress' | 'rejectNoLongerRequired' | 'rejectManagerDecision'
export default class ChangeRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly placementService: PlacementService,
  ) {}

  review(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { placementRequestId, changeRequestId } = req.params
      const errorsAndUserInput = fetchErrorsAndUserInput(req)

      const [changeRequest, placementRequest, rejectionReasons]: [
        Cas1ChangeRequest,
        Cas1PlacementRequestDetail,
        Array<NamedId>,
      ] = await Promise.all([
        this.placementRequestService.getChangeRequest(req.user.token, {
          placementRequestId,
          changeRequestId,
        }),
        this.placementRequestService.getPlacementRequest(req.user.token, placementRequestId),
        this.placementRequestService.getChangeRequestRejectionReasons(req.user.token, 'placementAppeal'),
      ])

      const changeRequestSummary = changeRequestSummaryList(changeRequest)
      const rejectionOptions = mapChangeRequestReasonsToRadios(rejectionReasons, '', {})

      const decisionOptions: Array<{ value: string; text: string } | { divider: 'or' }> = [
        ...rejectionOptions,
        { divider: 'or' },
        { text: 'Progress appeal', value: 'progress' },
      ]

      res.render('admin/placementRequests/changeRequests/review', {
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        pageHeading: 'Review appeal',
        backLink: paths.admin.placementRequests.show({ placementRequestId }),
        bookingSummary: placementRequest.booking && placementSummaryList(placementRequest),
        changeRequestSummary,
        ...errorsAndUserInput,
        decisionOptions,
      })
    }
  }

  decide(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { placementRequestId, changeRequestId } = req.params
      const {
        body: { decision, notes },
      } = req as { body: { decision: AppealDecision; notes: string } }

      try {
        if (!decision) {
          throw new ValidationError({ decision: 'You must select a decision' })
        }

        if (decision === 'progress') {
          const changeRequest: Cas1ChangeRequest = await this.placementRequestService.getChangeRequest(req.user.token, {
            placementRequestId,
            changeRequestId,
          })

          const placement: Cas1SpaceBooking = await this.placementService.getPlacement(
            req.user.token,
            changeRequest.spaceBookingId,
          )

          const approvedPlacementAppeal: Cas1ApprovedPlacementAppeal = {
            occurredAt: DateFormats.dateObjToIsoDate(new Date()),
            placementAppealChangeRequestId: changeRequestId,
            reasonNotes: notes,
          }

          await this.placementService.approvePlacementAppeal(
            req.user.token,
            placement.premises.id,
            changeRequest.spaceBookingId,
            approvedPlacementAppeal,
          )

          req.flash('success', {
            heading: 'Appeal actioned',
            body: `<p>The appealed placement has been cancelled. You will need to re-book via the 'Ready to match' list.</p>`,
          })
        } else {
          const rejectionReasons = await this.placementRequestService.getChangeRequestRejectionReasons(
            req.user.token,
            'placementAppeal',
          )
          const rejectChangeRequest: Cas1RejectChangeRequest = {
            decisionJson: { notes },
            rejectionReasonId: getChangeRequestReasonId(decision, rejectionReasons),
          }

          await this.placementRequestService.rejectChangeRequest(req.user.token, {
            placementRequestId,
            changeRequestId,
            rejectChangeRequest,
          })
          req.flash('success', {
            heading: 'Appeal rejected',
            body: `<p>The placement remains in place. An email will be sent to the AP manager that made the appeal.</p>`,
          })
        }
        return res.redirect(paths.admin.placementRequests.show({ placementRequestId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.admin.placementRequests.changeRequests.review({ placementRequestId, changeRequestId }),
        )
      }
    }
  }
}
