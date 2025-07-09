import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { Cas1SpaceCharacteristic } from '@approved-premises/api'
import PremisesService from '../../../services/premisesService'
import BedsController from './bedsController'
import {
  cas1BedDetailFactory,
  cas1PremisesBedSummaryFactory,
  cas1PremisesFactory,
  userDetailsFactory,
} from '../../../testutils/factories'
import paths from '../../../paths/manage'
import * as bedUtils from '../../../utils/bedUtils'
import { bedsTableHeader } from '../../../utils/bedUtils'

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
        actions: bedUtils.bedActions(bed, premises.id, request.session.user),
        characteristicsSummaryList: bedUtils.characteristicsSummary(bed.characteristics),
      })

      expect(premisesService.getBed).toHaveBeenCalledWith(token, premises.id, bedId)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
    })
  })

  describe('index', () => {
    const premises = cas1PremisesFactory.build()
    const beds = [
      ...cas1PremisesBedSummaryFactory.buildList(9, { characteristics: ['isSingle'] }),
      cas1PremisesBedSummaryFactory.build({ characteristics: ['hasEnSuite'] }),
    ]

    beforeEach(() => {
      premisesService.getBeds.mockResolvedValue(beds)
      premisesService.find.mockResolvedValue(premises)
    })
    it('should return the beds to the template', async () => {
      jest.spyOn(bedUtils, 'calculateBedCounts').mockReturnValue({ hasEnSuite: 1 })

      request.params.premisesId = premises.id

      const requestHandler = bedsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/beds/index', {
        backLink: paths.premises.show({ premisesId: premises.id }),
        premises,
        characteristicOptions: [{ checked: false, text: 'En-suite (1)', value: 'hasEnSuite' }],
        pageHeading: 'Manage beds',
        actions: bedUtils.bedsActions(premises.id, request.session.user),
        tableRows: bedUtils.bedsTableRows(beds, premises.id),
        tableHeader: bedsTableHeader(),
        tableCaption: 'Showing 10 beds',
      })

      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(premisesService.getBeds).toHaveBeenCalledWith(token, premises.id)
    })

    it.each([
      ['multiple rows', 'isSingle', 'Showing 9 beds that are single room'],
      ['single row', 'hasEnSuite', 'Showing 1 bed that is en-suite'],
    ])(
      'should filter the beds by characteristics returning %s',
      async (_, characteristic: Cas1SpaceCharacteristic, heading) => {
        request.params.premisesId = premises.id
        request.query.characteristics = [characteristic]
        await bedsController.index()(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'manage/premises/beds/index',
          expect.objectContaining({
            tableRows: bedUtils.bedsTableRows(
              beds.filter(({ characteristics }) => characteristics.includes(characteristic)),
              premises.id,
            ),
            tableCaption: heading,
          }),
        )
      },
    )
  })
})
