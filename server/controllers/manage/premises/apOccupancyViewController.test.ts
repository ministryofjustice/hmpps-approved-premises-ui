import type { Cas1PremisesSummary } from '@approved-premises/api'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PremisesService } from 'server/services'
import ApOccupancyViewController from './apOccupancyViewController'

import { cas1PremiseCapacityFactory, cas1PremisesSummaryFactory } from '../../../testutils/factories'

import paths from '../../../paths/manage'
import { occupancyCalendar } from '../../../utils/premises/occupancy'
import { DateFormats } from '../../../utils/dateUtils'

describe('AP occupancyViewController', () => {
  const token = 'TEST_TOKEN'
  const premisesId = 'some-uuid'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const occupancyViewController = new ApOccupancyViewController(premisesService)

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token }, params: { premisesId }, flash: jest.fn() })
    response = createMock<Response>({ locals: { user: { permissions: ['cas1_space_booking_list'] } } })

    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01'))
  })

  describe('view', () => {
    const mockPremises = async (startDate: string = DateFormats.dateObjToIsoDate(new Date())) => {
      const premisesSummary: Cas1PremisesSummary = cas1PremisesSummaryFactory.build({ id: premisesId })
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
      const endDate = '2024-03-25'
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
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premisesId, startDate, endDate)
    })

    it('should render the premises occupancy view with specified valid date and duration', async () => {
      request = createMock<Request>({
        user: { token },
        params: { premisesId },
        flash: jest.fn(),
        query: { 'startDate-year': '2024', 'startDate-month': '06', 'startDate-day': '20', durationDays: '7' },
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
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premisesId, '2024-06-20', '2024-06-27')
    })

    it('should render error if date is invalid', async () => {
      request = createMock<Request>({
        user: { token },
        params: { premisesId },
        flash: jest.fn(),
        query: { 'startDate-year': '2023', 'startDate-month': '02', 'startDate-day': '29', durationDays: '7' },
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
})
