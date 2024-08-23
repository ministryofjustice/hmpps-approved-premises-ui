import { addDays, subDays } from 'date-fns'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ApAreaService, PremisesService } from '../../../services'
import PremisesController from './premisesController'

import {
  apAreaFactory,
  bedOccupancyRangeFactoryUi,
  extendedPremisesSummaryFactory,
  premisesSummaryFactory,
} from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const apAreaService = createMock<ApAreaService>({})
  const premisesController = new PremisesController(premisesService, apAreaService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token }, params: { premisesId } })
    jest.useFakeTimers()
  })

  describe('index', () => {
    it('should render the template with the premises and areas', async () => {
      const premisesSummaries = premisesSummaryFactory.buildList(1)

      const apAreas = apAreaFactory.buildList(1)

      apAreaService.getApAreas.mockResolvedValue(apAreas)
      premisesService.getAll.mockResolvedValue(premisesSummaries)

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/index', {
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

      expect(response.render).toHaveBeenCalledWith('premises/index', {
        premisesSummaries,
        areas,
        selectedArea: areaId,
      })

      expect(premisesService.getAll).toHaveBeenCalledWith(token, areaId)
      expect(apAreaService.getApAreas).toHaveBeenCalledWith(token)
    })
  })

  describe('show', () => {
    it('should return the premises detail to the template', async () => {
      const premises = extendedPremisesSummaryFactory.build()
      premisesService.getPremisesDetails.mockResolvedValue(premises)

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/show', {
        premises,
        bookings: premises.bookings,
        premisesId: request.params.premisesId,
      })

      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith(token, premisesId)
    })
  })

  describe('calendar', () => {
    const occupancy = bedOccupancyRangeFactoryUi.buildList(2)
    const premises = extendedPremisesSummaryFactory.build()
    const requestHandler = premisesController.calendar()

    beforeEach(() => {
      premisesService.getOccupancy.mockResolvedValue(occupancy)
      premisesService.getPremisesDetails.mockResolvedValue(premises)
    })

    it('renders the calendar view', async () => {
      await requestHandler(request, response, next)

      const startDate = new Date()
      const nextDate = DateFormats.dateObjToIsoDate(addDays(startDate, 14))
      const previousDate = DateFormats.dateObjToIsoDate(subDays(startDate, 14))

      expect(premisesService.getOccupancy).toHaveBeenCalledWith(
        token,
        premisesId,
        DateFormats.dateObjToIsoDate(startDate),
        DateFormats.dateObjToIsoDate(addDays(startDate, 30)),
      )
      expect(response.render).toHaveBeenCalledWith('premises/calendar', {
        bedOccupancyRangeList: occupancy,
        premisesId: request.params.premisesId,
        premises,
        startDate,
        nextDate,
        previousDate,
      })
    })

    it('allows a startDate to be passed in', async () => {
      request.query = { startDate: '2023-01-15' }
      await requestHandler(request, response, next)

      const startDate = new Date(2023, 0, 15)
      const nextDate = DateFormats.dateObjToIsoDate(new Date(2023, 0, 29))
      const previousDate = DateFormats.dateObjToIsoDate(new Date(2023, 0, 1))

      expect(premisesService.getOccupancy).toHaveBeenCalledWith(
        token,
        premisesId,
        DateFormats.dateObjToIsoDate(startDate),
        DateFormats.dateObjToIsoDate(addDays(startDate, 30)),
      )

      expect(response.render).toHaveBeenCalledWith('premises/calendar', {
        bedOccupancyRangeList: occupancy,
        premisesId: request.params.premisesId,
        premises,
        startDate,
        nextDate,
        previousDate,
      })
    })
  })
})
