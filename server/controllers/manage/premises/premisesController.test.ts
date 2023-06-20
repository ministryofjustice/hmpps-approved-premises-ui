import { addDays } from 'date-fns'
import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { GroupedListofBookings, SummaryListItem } from '@approved-premises/ui'
import { Booking } from '@approved-premises/api'
import PremisesService from '../../../services/premisesService'
import BookingService from '../../../services/bookingService'
import PremisesController from './premisesController'

import { bedOccupancyRangeFactoryUi } from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bookingService = createMock<BookingService>({})
  const premisesController = new PremisesController(premisesService, bookingService)

  describe('index', () => {
    it('should return the table rows to the template', async () => {
      premisesService.tableRows.mockResolvedValue([])

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/index', { tableRows: [] })

      expect(premisesService.tableRows).toHaveBeenCalledWith(token)
    })
  })

  describe('show', () => {
    it('should return the premises detail to the template', async () => {
      const premises = { name: 'Some premises', summaryList: { rows: [] as Array<SummaryListItem> } }
      const bookings = createMock<GroupedListofBookings>()
      const currentResidents = createMock<Array<Booking>>()
      const overcapacityMessage = 'The premises is over capacity for the period January 1st 2023 to Feburary 3rd 2023'
      premisesService.getPremisesDetails.mockResolvedValue(premises)
      premisesService.getOvercapacityMessage.mockResolvedValue([overcapacityMessage])
      bookingService.groupedListOfBookingsForPremisesId.mockResolvedValue(bookings)
      bookingService.currentResidents.mockResolvedValue(currentResidents)

      request.params.premisesId = 'some-uuid'

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/show', {
        premisesId: 'some-uuid',
        premises,
        bookings,
        currentResidents,
        infoMessages: [overcapacityMessage],
      })

      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith(token, 'some-uuid')
      expect(bookingService.groupedListOfBookingsForPremisesId).toHaveBeenCalledWith(token, 'some-uuid')
      expect(bookingService.currentResidents).toHaveBeenCalledWith(token, 'some-uuid')
    })
  })

  describe('calendar', () => {
    it('renders the calendar view', async () => {
      const occupancy = bedOccupancyRangeFactoryUi.buildList(2)

      premisesService.getOccupancy.mockResolvedValue(occupancy)

      const requestHandler = premisesController.calendar()
      await requestHandler(request, response, next)

      expect(premisesService.getOccupancy).toHaveBeenCalledWith(
        token,
        'some-uuid',
        DateFormats.dateObjToIsoDate(new Date()),
        DateFormats.dateObjToIsoDate(addDays(new Date(), 30)),
      )
      expect(response.render).toHaveBeenCalledWith('premises/calendar', {
        bedOccupancyRangeList: occupancy,
        premisesId: request.params.premisesId,
        startDate: new Date(),
      })
    })
  })
})
