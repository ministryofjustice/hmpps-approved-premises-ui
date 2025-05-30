import type { Request, Response, TypedRequestHandler } from 'express'

import {
  Cas1ApprovedPlacementAppeal,
  Cas1ChangeRequest,
  Cas1RejectChangeRequest,
  Cas1SpaceBooking,
  NamedId,
  Unit,
} from '@approved-premises/api'
import { ValidationError } from '../../../utils/errors'
import { PlacementRequestService, PlacementService } from '../../../services'
import paths from '../../../paths/admin'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { placementSummaryList } from '../../../utils/placementRequests/placementSummaryList'
import { bookingSummaryList } from '../../../utils/bookings'
import { changeRequestSummaryList } from '../../../utils/placementRequests/changeRequestSummaryList'
import { DateFormats } from '../../../utils/dateUtils'
import { mapChangeRequestReasonsToRadios } from '../../../utils/placements/changeRequests'

type AppealDecision = 'progress' | 'rejectNoLongerRequired' | 'rejectManagerDecision'
export default class ChangeRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly placementService: PlacementService,
  ) {}

  review(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { id: placementRequestId, changeRequestId } = req.params
      const errorsAndUserInput = fetchErrorsAndUserInput(req)
      const changeRequest: Cas1ChangeRequest = await this.placementRequestService.getChangeRequest(req.user.token, {
        placementRequestId,
        changeRequestId,
      })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      const rejectionReasons: Array<NamedId> = await this.placementRequestService.getChangeRequestRejectionReasons(
        req.user.token,
        'placementAppeal',
      )
      const bookingSummary =
        placementRequest.booking &&
        (placementRequest.booking.type === 'space'
          ? placementSummaryList(placementRequest)
          : bookingSummaryList(placementRequest.booking))
      const changeRequestSummary = changeRequestSummaryList(changeRequest)
      const rejectionOptions = mapChangeRequestReasonsToRadios(rejectionReasons, '', {})
      const decisionOptions: Array<{ value: string; text: string } | { divider: 'or' }> = [
        ...rejectionOptions,
        { divider: 'or' },
        { text: 'Progress appeal', value: 'progress' },
      ]

      res.render('admin/placementRequests/changeRequests/review', {
        placementRequest,
        pageHeading: 'Review appeal',
        formAction: paths.admin.placementRequests.changeRequests.review({ id: placementRequestId, changeRequestId }),
        backLink: paths.admin.placementRequests.show({ id: placementRequestId }),
        bookingSummary,
        changeRequestSummary,
        ...errorsAndUserInput,
        decisionOptions,
      })
    }
  }

  decide(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { id: placementRequestId, changeRequestId } = req.params
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
          const rejectionReasons: Array<NamedId> = await this.placementRequestService.getChangeRequestRejectionReasons(
            req.user.token,
            'placementAppeal',
          )

          const rejectionReasonId = rejectionReasons.find(({ name }) => name === decision)?.id
          if (!rejectionReasonId) {
            throw new ValidationError({ decision: 'Decision not valid' })
          }

          const rejectChangeRequest: Cas1RejectChangeRequest = {
            decisionJson: { notes } as unknown as Record<string, Unit>, // TODO: Incorrect API type - see APS-2353
            rejectionReasonId,
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
        return res.redirect(paths.admin.placementRequests.show({ id: placementRequestId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.admin.placementRequests.changeRequests.review({ id: placementRequestId, changeRequestId }),
        )
      }
    }
  }
}
