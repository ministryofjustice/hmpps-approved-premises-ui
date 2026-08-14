import type { Request, Response, TypedRequestHandler } from 'express'
import { Cas1RequestsForPlacementDurationsCalculationResponseDto } from '@approved-premises/api'
import { ApplicationService, PlacementApplicationService, PlacementRequestService } from '../../services'
import paths from '../../paths/placementApplications'
import { addErrorMessageToFlash, catchValidationErrorOrPropogate } from '../../utils/validation'
import { getResponses } from '../../utils/applications/getResponses'
import { placementRequestKeyDetails } from '../../utils/placementRequests/utils'
import {
  durationAndArrivalDateFromPlacementApplication,
  placementApplicationSubmissionData,
} from '../../utils/placementRequests/placementApplicationSubmissionData'
import { getSentenceType } from '../../utils/placementApplications'

export default class PlacementRequestsController {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly placementApplicationService: PlacementApplicationService,
    private readonly applicationService: ApplicationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        req.params.placementRequestId,
      )

      res.render('match/placementRequests/show', {
        pageHeading: `Matching information`,
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
        placementRequest,
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const applicationId = req.body.applicationId || req.query.id
      const application = await this.placementApplicationService.create(req.user.token, applicationId)

      return res.redirect(
        paths.placementApplications.pages.show({
          id: application.id,
          task: 'request-a-placement',
          page: 'sentence-type-check',
        }),
      )
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { id } = req.params
      const { confirmation } = req.body

      if (confirmation !== '1') {
        addErrorMessageToFlash(
          req,
          'You must confirm that the information you have provided is correct',
          'confirmation',
        )
        return res.redirect(
          paths.placementApplications.pages.show({ id, task: 'request-a-placement', page: 'check-your-answers' }),
        )
      }

      const placementApplication = await this.placementApplicationService.getPlacementApplication(req.user.token, id)
      placementApplication.document = getResponses(placementApplication)
      const application = await this.applicationService.findApplication(
        req.user.token,
        placementApplication.applicationId,
      )
      try {
        const { releaseType, sentenceType } = getSentenceType(placementApplication)
        let placementDurations: Cas1RequestsForPlacementDurationsCalculationResponseDto
        if (releaseType === 'paroleDirectedLicence') {
          placementDurations = await this.applicationService.getPlacementDuration(
            req.user.token,
            application.id,
            application.apType,
            sentenceType,
          )
        }

        const requestedPlacementPeriods = durationAndArrivalDateFromPlacementApplication(
          placementApplication,
          placementDurations,
        )

        const submissionData = placementApplicationSubmissionData(placementApplication, requestedPlacementPeriods)

        await this.placementApplicationService.submit(req.user.token, placementApplication, submissionData)

        return res.render('placement-applications/confirm', {
          pageHeading: 'Request for placement confirmed',
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          paths.placementApplications.pages.show({ id, task: 'request-a-placement', page: 'check-your-answers' }),
        )
      }
    }
  }
}
