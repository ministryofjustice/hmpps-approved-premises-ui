import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PremisesService from '../../../services/premisesService'
import BedsController from './bedsController'
import {
  cas1BedDetailFactory,
  cas1PremisesBedSummaryFactory,
  cas1PremisesFactory,
  userDetailsFactory,
} from '../../../testutils/factories'
import paths from '../../../paths/manage'
import { bedActions, bedDetails, bedsActions, bedsTableRows } from '../../../utils/bedUtils'

describe('V2BedsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({
    user: { token },
    session: { user: userDetailsFactory.build() },
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedsController = new BedsController(premisesService)

  describe('show', () => {
    const bed = cas1BedDetailFactory.build()
    const premises = cas1PremisesFactory.build()
    const bedId = 'bedId'

    beforeEach(() => {
      request.params.premisesId = premises.id
      request.params.bedId = bedId
      premisesService.getBed.mockResolvedValue(bed)
      premisesService.find.mockResolvedValue(premises)
    })

    it('should return the bed to the template', async () => {
      const requestHandler = bedsController.show()

      request.headers.referer = 'http://localhost/'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/beds/show', {
        backLink: paths.premises.beds.index({ premisesId: premises.id }),
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        actions: bedActions(bed, premises.id, request.session.user),
        characteristicsSummaryList: bedDetails(bed),
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premises.id, bedId)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
    })
  })

  describe('index', () => {
    it('should return the beds to the template', async () => {
      const beds = cas1PremisesBedSummaryFactory.buildList(1)
      const premises = cas1PremisesFactory.build()
      request.params.premisesId = premises.id

      premisesService.getBeds.mockResolvedValue(beds)
      premisesService.find.mockResolvedValue(premises)

      const requestHandler = bedsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/beds/index', {
        backLink: paths.premises.show({ premisesId: premises.id }),
        premises,
        pageHeading: 'Manage beds',
        actions: bedsActions(premises.id, request.session.user),
        tableRows: bedsTableRows(beds, premises.id),
      })

      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(premisesService.getBeds).toHaveBeenCalledWith(token, premises.id)
    })
  })
})
