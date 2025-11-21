import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { PlacementService, SessionService } from '../../services'

import ResidentProfileController from './residentProfileController'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

describe('residentProfileController', () => {
  const token = 'TEST_TOKEN'
  const crn = 'S123456'
  const referrer = 'referrer/path'
  const user = { name: 'username' }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const sessionService = createMock<SessionService>({})
  const placementController = new ResidentProfileController(placementService, sessionService)
  const setUp = () => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    const placement = cas1SpaceBookingFactory.upcoming().build({
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })
    placementService.getPlacement.mockResolvedValue(placement)
    sessionService.getPageBackLink.mockReturnValue(referrer)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { crn, placementId: placement.id },
    })
    return { placement, request, response }
  }

  it('should render the Manage resident page', async () => {
    const { request, response, placement } = setUp()

    await placementController.show()(request, response, next)

    // TODO: Complete render context
    expect(response.render).toHaveBeenCalledWith(
      'manage/resident/residentProfile',
      expect.objectContaining({
        placement,
        pageHeading: 'Manage a resident',
        backLink: referrer,
        activeTab: 'personal',
      }),
    )
    expect(placementService.getTimeline).not.toHaveBeenCalled()
    expect(sessionService.getPageBackLink).toHaveBeenCalledWith(
      '/manage/premises/:premisesId/placements/:placementId',
      {},
      ['/manage/premises/:premisesId', '/manage/premises/:premisesId/occupancy/day/:date'],
    )
  })
})
