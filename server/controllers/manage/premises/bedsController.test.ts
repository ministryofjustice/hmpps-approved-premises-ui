import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { encodeOverbooking } from '../../../utils/bedUtils'
import PremisesService from '../../../services/premisesService'
import BedsController from './bedsController'
import {
  bedDetailFactory,
  bedOccupancyEntryOverbookingUiFactory,
  bedSummaryFactory,
} from '../../../testutils/factories'
import paths from '../../../paths/manage'

describe('BedsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedsController = new BedsController(premisesService)

  describe('index', () => {
    it('should return the beds to the template', async () => {
      const beds = bedSummaryFactory.buildList(1)
      const premisesId = 'premisesId'
      request.params.premisesId = premisesId

      premisesService.getBeds.mockResolvedValue(beds)

      const requestHandler = bedsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/beds/index', {
        beds,
        premisesId,
        pageHeading: 'Manage beds',
      })

      expect(premisesService.getBeds).toHaveBeenCalledWith(token, premisesId)
    })
  })

  describe('show', () => {
    const bed = bedDetailFactory.build()
    const premisesId = 'premisesId'
    const bedId = 'bedId'

    beforeEach(() => {
      request.params.premisesId = premisesId
      request.params.bedId = bedId
      premisesService.getBed.mockResolvedValue(bed)
    })

    it('should return the bed to the template', async () => {
      const requestHandler = bedsController.show()

      request.headers.referer = 'http://localhost/'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/beds/show', {
        bed,
        premisesId,
        pageHeading: 'Manage beds',
        backLink: paths.premises.beds.index({ premisesId }),
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premisesId, bedId)
    })

    it('should return the bed to the template with a link back to the calendar', async () => {
      const requestHandler = bedsController.show()

      request.headers.referer = 'http://localhost/calendar'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/beds/show', {
        bed,
        premisesId,
        pageHeading: 'Manage beds',
        backLink: paths.premises.calendar({ premisesId }),
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premisesId, bedId)
    })
  })

  describe('overbookings', () => {
    it('should return the bed and the overbookings to the template', async () => {
      const bed = bedDetailFactory.build()
      const overbooking = bedOccupancyEntryOverbookingUiFactory.build()
      const premisesId = 'premisesId'
      request.params.premisesId = premisesId
      const bedId = 'bedId'
      request.params.bedId = bedId
      request.query.overbooking = encodeOverbooking(overbooking)

      premisesService.getBed.mockResolvedValue(bed)

      const requestHandler = bedsController.overbookings()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/beds/overbookings/show', {
        bed,
        premisesId,
        overbooking,
        pageHeading: 'Manage Overbookings',
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premisesId, bedId)
    })
  })
})
