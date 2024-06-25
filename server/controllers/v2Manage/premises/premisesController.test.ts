import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PremisesService } from '../../../services'
import V2PremisesController from './premisesController'

import { extendedPremisesSummaryFactory, premisesFactory } from '../../../testutils/factories'

describe('V2PremisesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const premisesController = new V2PremisesController(premisesService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    jest.useFakeTimers()
  })

  describe('show', () => {
    it('should return the premises detail to the template', async () => {
      const fullPremises = premisesFactory.build()
      const premises = extendedPremisesSummaryFactory.build()

      premisesService.getPremisesDetails.mockResolvedValue(premises)
      premisesService.find.mockResolvedValue(fullPremises)

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/show', {
        premises,
        bookings: premises.bookings,
        apArea: fullPremises.apArea,
      })

      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith(token, premisesId)
    })
  })
})
