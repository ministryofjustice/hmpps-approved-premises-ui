import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { cas1PremisesSummaryFactory, cas1SpaceBookingFactory } from '../../testutils/factories'
import { PremisesService } from '../../services'
import PlacementController from './placementController'

describe('placementController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const placementController = new PlacementController(premisesService)

  const premisesId = 'premisesId'
  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    jest.useFakeTimers()
  })

  describe('show', () => {
    it('should render the placement view', async () => {
      const placement = cas1SpaceBookingFactory.build({
        canonicalArrivalDate: '2024-11-16',
        canonicalDepartureDate: '2025-03-26',
      })
      const premises = cas1PremisesSummaryFactory.build()
      premisesService.getPlacement.mockResolvedValue(placement)
      premisesService.find.mockResolvedValue(premises)

      const requestHandler = placementController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/show',
        expect.objectContaining({
          premises,
          placement,
          pageHeading: '16 Nov 2024 to 26 Mar 2025',
        }),
      )
    })
  })
})
