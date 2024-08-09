import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PremisesService from '../../../services/premisesService'
import BedsController from './bedsController'
import { bedDetailFactory, bedSummaryFactory, extendedPremisesSummaryFactory } from '../../../testutils/factories'
import paths from '../../../paths/manage'

describe('V2BedsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedsController = new BedsController(premisesService)

  describe('show', () => {
    const bed = bedDetailFactory.build()
    const premises = extendedPremisesSummaryFactory.build()
    const bedId = 'bedId'

    beforeEach(() => {
      request.params.premisesId = premises.id
      request.params.bedId = bedId
      premisesService.getBed.mockResolvedValue(bed)
      premisesService.getPremisesDetails.mockResolvedValue(premises)
    })

    it('should return the bed to the template', async () => {
      const requestHandler = bedsController.show()

      request.headers.referer = 'http://localhost/'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/beds/show', {
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        backLink: paths.v2Manage.premises.beds.index({ premisesId: premises.id }),
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premises.id, bedId)
      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith(token, premises.id)
    })

    it('should return the bed to the template with a link back to the calendar', async () => {
      const requestHandler = bedsController.show()

      request.headers.referer = 'http://localhost/calendar'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/beds/show', {
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        backLink: paths.premises.calendar({ premisesId: premises.id }),
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premises.id, bedId)
      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith(token, premises.id)
    })
  })

  describe('index', () => {
    it('should return the beds to the template', async () => {
      const beds = bedSummaryFactory.buildList(1)
      const premisesId = 'premisesId'
      request.params.premisesId = premisesId

      premisesService.getBeds.mockResolvedValue(beds)

      const requestHandler = bedsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/beds/index', {
        beds,
        premisesId,
        pageHeading: 'Manage beds',
      })

      expect(premisesService.getBeds).toHaveBeenCalledWith(token, premisesId)
    })
  })
})
