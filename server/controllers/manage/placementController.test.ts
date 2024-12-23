import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import {
  applicationFactory,
  assessmentFactory,
  cas1SpaceBookingFactory,
  placementRequestDetailFactory,
  timelineEventFactory,
} from '../../testutils/factories'
import type {
  ApplicationService,
  AssessmentService,
  PlacementRequestService,
  PlacementService,
  PremisesService,
} from '../../services'
import PlacementController from './placementController'
import { mapApplicationTimelineEventsForUi } from '../../utils/applications/utils'

describe('placementController', () => {
  const token = 'TEST_TOKEN'
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const applicationService = createMock<ApplicationService>({})
  const assessmentService = createMock<AssessmentService>({})
  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const placementController = new PlacementController(
    applicationService,
    assessmentService,
    placementRequestService,
    placementService,
    premisesService,
  )

  const premisesId = 'premises-id'
  const referrer = 'referrer/path'
  const user = { name: 'username' }

  const setUp = () => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    const application = applicationFactory.build()
    const assessment = assessmentFactory.build({ application })
    const placementRequestDetail = placementRequestDetailFactory.build({
      applicationId: application.id,
      assessmentId: assessment.id,
    })
    const timeLine = timelineEventFactory.buildList(10)
    const placement = cas1SpaceBookingFactory.build({
      applicationId: application.id,
      assessmentId: assessment.id,
      requestForPlacementId: placementRequestDetail.id,
      canonicalArrivalDate: '2024-11-16',
      canonicalDepartureDate: '2025-03-26',
    })
    applicationService.findApplication.mockResolvedValue(application)
    assessmentService.findAssessment.mockResolvedValue(assessment)
    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.getPlacement.mockResolvedValue(placement)
    placementService.getTimeline.mockResolvedValue(timeLine)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { premisesId, placementId: placement.id },
      headers: { referer: referrer },
    })
    return { application, assessment, placementRequestDetail, timeLine, placement, request, response }
  }

  describe('show', () => {
    it('should render the placement view (on the default tab)', async () => {
      const { request, response, placement } = setUp()

      await placementController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          placement,
          pageHeading: '16 Nov 2024 to 26 Mar 2025',
          user,
          backLink: null,
          activeTab: 'placement',
        }),
      )
      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).not.toHaveBeenCalled()
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
      expect(placementRequestService.getPlacementRequest).not.toHaveBeenCalled()
      expect(placementService.getTimeline).not.toHaveBeenCalled()
    })

    it('should render the placement view (on the application tab)', async () => {
      const { placement, application, request, response } = setUp()

      await placementController.show('application')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          placement,
          application,
          activeTab: 'application',
        }),
      )

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).toHaveBeenCalledWith(token, application.id)
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
      expect(placementRequestService.getPlacementRequest).not.toHaveBeenCalled()
      expect(placementService.getTimeline).not.toHaveBeenCalled()
    })

    it('should render the placement view (on the assessment tab)', async () => {
      const { placement, assessment, request, response } = setUp()

      await placementController.show('assessment')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          placement,
          assessment,
          activeTab: 'assessment',
        }),
      )
      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).not.toHaveBeenCalled()
      expect(assessmentService.findAssessment).toHaveBeenCalledWith(token, assessment.id)
      expect(placementRequestService.getPlacementRequest).not.toHaveBeenCalled()
      expect(placementService.getTimeline).not.toHaveBeenCalled()
    })

    it('should render the placement view (on the placement request tab)', async () => {
      const { placement, placementRequestDetail, request, response } = setUp()

      await placementController.show('placementRequest')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          placement,
          placementRequestDetail,
        }),
      )

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).not.toHaveBeenCalled()
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(placementService.getTimeline).not.toHaveBeenCalled()
    })

    it('should render the placement view (on the timeline tab)', async () => {
      const { placement, timeLine, request, response } = setUp()

      await placementController.show('timeline')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          placement,
          timelineEvents: mapApplicationTimelineEventsForUi(timeLine).map(event => ({
            ...event,
            associatedUrls: null,
          })),
        }),
      )

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).not.toHaveBeenCalled()
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
      expect(placementRequestService.getPlacementRequest).not.toHaveBeenCalled()
      expect(placementService.getTimeline).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
    })
  })
})
