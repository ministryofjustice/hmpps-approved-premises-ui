import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { PlacementService } from '../../services'

import paths from '../../paths/manage'

import ResidentProfileController from './residentProfileController'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

describe('residentProfileController', () => {
  const token = 'TEST_TOKEN'
  const crn = 'S123456'
  const user = { name: 'username' }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const placementController = new ResidentProfileController(placementService)

  const setUp = () => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    const placement = cas1SpaceBookingFactory.upcoming().build({
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })
    placementService.getPlacement.mockResolvedValue(placement)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { crn, placementId: placement.id },
    })
    return { placement, request, response }
  }

  it('should render the Manage resident page on default tab', async () => {
    const { request, response, placement } = setUp()

    await placementController.show()(request, response, next)

    // TODO: Complete render context
    expect(response.render).toHaveBeenCalledWith(
      'manage/resident/residentProfile',
      expect.objectContaining({
        placement,
        pageHeading: 'Manage a resident',
        backLink: paths.premises.show({ premisesId: placement.premises.id }),
        activeTab: 'personal',
      }),
    )
  })
})
