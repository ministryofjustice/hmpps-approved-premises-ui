import type { Cas1Premises, Cas1PremisesDaySummary } from '@approved-premises/api'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PremisesService, SessionService } from 'server/services'
import { ParsedQs } from 'qs'
import ApOccupancyViewController from './apOccupancyViewController'

import {
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
} from '../../../testutils/factories'

import paths from '../../../paths/manage'
import {
  daySummaryRows,
  generateDaySummaryText,
  occupancyCalendar,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableHeader,
} from '../../../utils/premises/occupancy'
import { DateFormats } from '../../../utils/dateUtils'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'

describe('AP occupancyViewController', () => {
  const token = 'TEST_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const sessionService = createMock<SessionService>({})

  const occupancyViewController = new ApOccupancyViewController(premisesService, sessionService)

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token }, params: { premisesId }, flash: jest.fn() })
    response = createMock<Response>({ locals: { user: { permissions: ['cas1_space_booking_list'] } } })
    sessionService.getPageBackLink.mockReturnValue('back-link')
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01'))
  })

  describe('view', () => {
    const mockPremises = async (startDate: string = DateFormats.dateObjToIsoDate(new Date())) => {
      const premisesSummary: Cas1Premises = cas1PremisesFactory.build({ id: premisesId })
      const premisesCapacity = cas1PremiseCapacityFactory.build({ startDate })
      premisesService.getCapacity.mockResolvedValue(premisesCapacity)
      premisesService.find.mockResolvedValue(premisesSummary)

      const requestHandler = occupancyViewController.view()
      await requestHandler(request, response, next)

      return {
        premisesSummary,
        premisesCapacity,
      }
    }

    it('should render the premises occupancy view with default date and duration', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-03-24'
      const { premisesSummary, premisesCapacity } = await mockPremises(startDate)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/occupancy/view',
        expect.objectContaining({
          pageHeading: `View spaces in ${premisesSummary.name}`,
          calendarHeading: 'Showing 12 weeks from 1 Jan 2024',
          premises: premisesSummary,
          backLink: paths.premises.show({ premisesId }),
          calendar: occupancyCalendar(premisesCapacity.capacity, premisesId),
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premisesId, { startDate, endDate })
    })

    it('should render the premises occupancy view with specified valid date and duration', async () => {
      request = createMock<Request>({
        user: { token },
        params: { premisesId },
        flash: jest.fn(),
        query: { startDate: '20/06/2024', durationDays: '7' },
      })
      const { premisesSummary, premisesCapacity } = await mockPremises('2024-06-20')

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/occupancy/view',
        expect.objectContaining({
          calendarHeading: 'Showing 1 week from 20 Jun 2024',
          premises: premisesSummary,
          backLink: paths.premises.show({ premisesId }),
          calendar: occupancyCalendar(premisesCapacity.capacity, premisesId),
          errorSummary: [],
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premisesId, {
        startDate: '2024-06-20',
        endDate: '2024-06-26',
      })
    })

    it('should render error if date is invalid', async () => {
      request = createMock<Request>({
        user: { token },
        params: { premisesId },
        flash: jest.fn(),
        query: { startDate: 'not really a date', durationDays: '7' },
      })
      const { premisesSummary } = await mockPremises('2024-06-20')

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/occupancy/view',
        expect.objectContaining({
          premises: premisesSummary,
          backLink: paths.premises.show({ premisesId }),
          calendar: [],
          errorSummary: [{ text: 'Enter a valid date', href: '#startDate' }],
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getCapacity).not.toHaveBeenCalled()
    })
  })

  describe('dayView', () => {
    const mockPremises = async (
      date: string = DateFormats.dateObjToIsoDate(new Date()),
      queryParameters: ParsedQs = {},
    ) => {
      const premisesSummary: Cas1Premises = cas1PremisesFactory.build({ id: premisesId })
      const premisesDaySummary: Cas1PremisesDaySummary = cas1PremisesDaySummaryFactory.build({ forDate: date })
      const dayCapacity = cas1PremiseCapacityForDayFactory.build()
      const capacityForDay = cas1PremiseCapacityFactory.build({ capacity: [dayCapacity] })
      premisesService.getDaySummary.mockResolvedValue(premisesDaySummary)
      premisesService.find.mockResolvedValue(premisesSummary)
      premisesService.getCapacity.mockResolvedValue(capacityForDay)
      request.params.date = date
      request.query = queryParameters
      const requestHandler = occupancyViewController.dayView()
      await requestHandler(request, response, next)
      return {
        premisesSummary,
        premisesDaySummary,
        dayCapacity,
      }
    }

    it('should render the premises day summary with default sort and filter', async () => {
      const date = '2025-01-01'
      const { premisesSummary, premisesDaySummary, dayCapacity } = await mockPremises(date)

      expect(response.render).toHaveBeenCalledWith('manage/premises/occupancy/dayView', {
        premises: premisesSummary,
        pageHeading: DateFormats.isoDateToUIDate(date),
        backLink: 'back-link',
        previousDayLink: `${paths.premises.occupancy.day({ premisesId, date: '2024-12-31' })}`,
        nextDayLink: `${paths.premises.occupancy.day({ premisesId, date: '2025-01-02' })}`,
        daySummaryRows: daySummaryRows(dayCapacity),
        daySummaryText: generateDaySummaryText(dayCapacity),
        placementTableCaption: 'People booked in on Wed 1 Jan 2025',
        placementTableHeader: tableHeader(
          placementColumnMap,
          'personName',
          'asc',
          '/manage/premises/some-uuid/occupancy/day/2025-01-01',
        ),
        placementTableRows: placementTableRows(premisesId, premisesDaySummary.spaceBookingSummaries),
        outOfServiceBedCaption: 'Out of service beds on Wed 1 Jan 2025',
        outOfServiceBedTableHeader: tableHeader(outOfServiceBedColumnMap, 'personName', 'asc', ''),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premisesId, premisesDaySummary.outOfServiceBeds),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, []),
      })
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getDaySummary).toHaveBeenCalledWith({
        token,
        premisesId,
        date,
        bookingsSortBy: 'personName',
        bookingsSortDirection: 'asc',
      })
    })

    it('should render the premises day summary with specified sort and filter', async () => {
      const date = '2025-01-01'
      const { premisesSummary } = await mockPremises(date, {
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'desc',
        characteristics: ['hasEnSuite'],
      })
      const result = response.render.mock.calls[0][1]
      expect(result).toEqual(
        expect.objectContaining({
          premises: premisesSummary,
          previousDayLink: `${paths.premises.occupancy.day({
            premisesId,
            date: '2024-12-31',
          })}?sortBy=canonicalArrivalDate&sortDirection=desc&characteristics=hasEnSuite`,
          nextDayLink: `${paths.premises.occupancy.day({
            premisesId,
            date: '2025-01-02',
          })}?sortBy=canonicalArrivalDate&sortDirection=desc&characteristics=hasEnSuite`,
          placementTableHeader: tableHeader(
            placementColumnMap,
            'canonicalArrivalDate',
            'desc',
            '/manage/premises/some-uuid/occupancy/day/2025-01-01?characteristics=hasEnSuite',
          ),
        }),
      )
      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)
      expect(premisesService.getDaySummary).toHaveBeenCalledWith({
        token,
        premisesId,
        date,
        bookingsSortBy: 'canonicalArrivalDate',
        bookingsSortDirection: 'desc',
        bookingsCriteriaFilter: ['hasEnSuite'],
      })
    })
  })
})
