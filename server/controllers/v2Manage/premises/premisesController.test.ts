import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApAreaService, PremisesService } from '../../../services'
import V2PremisesController from './premisesController'

import { apAreaFactory, cas1PremisesSummaryFactory, premisesSummaryFactory } from '../../../testutils/factories'

describe('V2PremisesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const apAreaService = createMock<ApAreaService>({})
  const premisesController = new V2PremisesController(premisesService, apAreaService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    jest.useFakeTimers()
  })

  describe('show', () => {
    it('should return the premises detail to the template', async () => {
      const premisesSummary = cas1PremisesSummaryFactory.build()

      premisesService.find.mockResolvedValue(premisesSummary)

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/show', {
        premises: premisesSummary,
      })

      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
    })
  })

  describe('index', () => {
    it('should render the template with the premises and areas', async () => {
      const premisesSummaries = premisesSummaryFactory.buildList(1)

      const apAreas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(apAreas)
      premisesService.getAll.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/index', {
        premisesSummaries,
        areas: apAreas,
        selectedArea: '',
      })

      expect(premisesService.getAll).toHaveBeenCalledWith(token, undefined)
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })

    it('should call the premises service with the AP area ID if supplied', async () => {
      const areaId = 'ap-area-id'
      const premisesSummaries = premisesSummaryFactory.buildList(1)
      const areas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(areas)
      premisesService.getAll.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler({ ...request, body: { selectedArea: areaId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/premises/index', {
        premisesSummaries,
        areas,
        selectedArea: areaId,
      })

      expect(premisesService.getAll).toHaveBeenCalledWith(token, areaId)
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })
  })
})
