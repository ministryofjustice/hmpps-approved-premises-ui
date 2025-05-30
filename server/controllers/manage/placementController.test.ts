import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { TabItem } from 'server/utils/tasks/listTable'
import {
  applicationFactory,
  assessmentFactory,
  cas1PlacementRequestDetailFactory,
  cas1SpaceBookingFactory,
  cas1TimelineEventFactory,
} from '../../testutils/factories'
import type {
  ApplicationService,
  AssessmentService,
  PlacementRequestService,
  PlacementService,
  PremisesService,
  SessionService,
} from '../../services'
import PlacementController from './placementController'
import { mapApplicationTimelineEventsForUi } from '../../utils/applications/utils'
import { adminSummary } from '../../utils/placementRequests'
import { matchingInformationSummaryRows } from '../../utils/placementRequests/matchingInformationSummaryList'

describe('placementController', () => {
  const token = 'TEST_TOKEN'
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const applicationService = createMock<ApplicationService>({})
  const assessmentService = createMock<AssessmentService>({})
  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const sessionService = createMock<SessionService>({})
  const placementController = new PlacementController(
    applicationService,
    assessmentService,
    placementRequestService,
    placementService,
    premisesService,
    sessionService,
  )

  const premisesId = 'premises-id'
  const referrer = 'referrer/path'
  const user = { name: 'username' }

  const setUp = (offlineApplication = false) => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    const application = applicationFactory.build()
    const assessment = assessmentFactory.build({ application })
    const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
      applicationId: application.id,
      assessmentId: assessment.id,
    })
    const timeLine = cas1TimelineEventFactory.buildList(10)
    const placement = cas1SpaceBookingFactory.upcoming().build({
      applicationId: application.id,
      assessmentId: offlineApplication ? undefined : assessment.id,
      placementRequestId: offlineApplication ? undefined : placementRequestDetail.id,
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })
    applicationService.findApplication.mockResolvedValue(application)
    assessmentService.findAssessment.mockResolvedValue(assessment)
    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.getPlacement.mockResolvedValue(placement)
    placementService.getTimeline.mockResolvedValue(timeLine)
    sessionService.getPageBackLink.mockReturnValue(referrer)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { premisesId, placementId: placement.id },
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
          backLink: referrer,
          activeTab: 'placement',
        }),
      )
      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).not.toHaveBeenCalled()
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
      expect(placementRequestService.getPlacementRequest).not.toHaveBeenCalled()
      expect(placementService.getTimeline).not.toHaveBeenCalled()
      expect(sessionService.getPageBackLink).toHaveBeenCalledWith(
        '/manage/premises/:premisesId/placements/:placementId',
        {},
        [
          '/manage/premises/:premisesId',
          '/manage/premises/:premisesId/occupancy/day/:date',
          '/applications/:id',
          '/people/timeline/show',
        ],
      )
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
          placementRequestSummaryRows: [
            ...adminSummary(placementRequestDetail).rows,
            ...matchingInformationSummaryRows(placementRequestDetail),
          ],
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
          timelineEvents: mapApplicationTimelineEventsForUi(timeLine, { hideUrls: true }),
        }),
      )

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, placementId: placement.id, premisesId })
      expect(applicationService.findApplication).not.toHaveBeenCalled()
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
      expect(placementRequestService.getPlacementRequest).not.toHaveBeenCalled()
      expect(placementService.getTimeline).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
    })

    it('should show a banner and disable some tabs if placement is for an offline application', async () => {
      const { request, response, placement } = setUp(true)

      await placementController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          placement,
          pageHeading: '16 Nov 2024 to 26 Mar 2025',
          user,
          backLink: referrer,
          activeTab: 'placement',
          isOfflineApplication: true,
        }),
      )
      const renderCall = response.render.mock.calls[0][1] as unknown as { tabItems: Array<TabItem> }
      expect(renderCall.tabItems[1]).toEqual(
        expect.objectContaining({ text: 'Assessment', classes: 'disabled', href: null }),
      )
      expect(renderCall.tabItems[2]).toEqual(
        expect.objectContaining({ text: 'Request for placement', classes: 'disabled', href: null }),
      )
      expect(renderCall.tabItems[3]).toEqual(expect.objectContaining({ text: 'Placement details', classes: '' }))
    })
  })
})
