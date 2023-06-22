import { addDays, differenceInDays, getDaysInMonth, subDays } from 'date-fns'
import {
  bedOccupancyEntryBookingUiFactory,
  bedOccupancyEntryUiFactory,
  bedOccupancyRangeFactoryUi,
} from '../testutils/factories'

import {
  bedRow,
  bedRows,
  bodyClass,
  bookingCellContent,
  calendar,
  calendarTableClass,
  cell,
  dateRow,
  formatDaysForDateRow,
  generateDays,
  generateRowCells,
  headClass,
  headerClass,
  labelForScheduleItem,
  monthRow,
  occupierName,
  overbookedCellContent,
  roomHeaderClass,
  rowClass,
  scheduleForCalendar,
  tableClass,
  wrapCellContentInTableCellMarkup,
} from './calendarUtils'
import { bedOccupancyEntryCalendarFactory } from '../testutils/factories/bedOccupancyRange'
import { DateFormats } from './dateUtils'

describe('calendarUtils', () => {
  const premisesId = 'some-uuid'

  describe('calendar', () => {
    it('should return calendar', () => {
      const bedOccupancyRangeList = bedOccupancyRangeFactoryUi.buildList(1)
      const startDate = new Date()

      expect(calendar(bedOccupancyRangeList, startDate, premisesId)).toMatchStringIgnoringWhitespace(
        `
        <table class="${calendarTableClass}" cellspacing="0">
          <thead class="${headClass}">
            <tr class="${rowClass} ${tableClass}__row--months">${monthRow(startDate)}</tr>
            ${dateRow(startDate)}
          </thead>
          <tbody class="${bodyClass}">${bedRows(bedOccupancyRangeList, startDate, premisesId)}</tbody>
        </table>
      `,
      )
    })
  })

  describe('dateRow', () => {
    it('should return dateRow', () => {
      const startDate = new Date()

      expect(dateRow(startDate)).toMatchStringIgnoringWhitespace(`
          <tr class="${rowClass}">
            ${formatDaysForDateRow(startDate)}
          </tr>`)
    })
  })

  describe('monthRow', () => {
    it('should return cells for each month in the date range that span all the dates of that month prefixed by an empty cell', () => {
      const startDate = new Date(2023, 5, 1)
      const colspan = getDaysInMonth(startDate)
      expect(monthRow(startDate)).toBe(
        `<th class="${roomHeaderClass}" rowspan="2">Room/Bed</th><th colspan="${colspan}" class="${headerClass} ${tableClass}__head--month">June</th>`,
      )
    })
  })

  describe('generateDays', () => {
    it('should return a string of the date for the next 30 days', () => {
      const days = generateDays(new Date(2023, 5, 14))
      expect(days).toHaveLength(30)
      expect(days).toEqual([
        new Date(2023, 5, 14),
        new Date(2023, 5, 15),
        new Date(2023, 5, 16),
        new Date(2023, 5, 17),
        new Date(2023, 5, 18),
        new Date(2023, 5, 19),
        new Date(2023, 5, 20),
        new Date(2023, 5, 21),
        new Date(2023, 5, 22),
        new Date(2023, 5, 23),
        new Date(2023, 5, 24),
        new Date(2023, 5, 25),
        new Date(2023, 5, 26),
        new Date(2023, 5, 27),
        new Date(2023, 5, 28),
        new Date(2023, 5, 29),
        new Date(2023, 5, 30),
        new Date(2023, 6, 1),
        new Date(2023, 6, 2),
        new Date(2023, 6, 3),
        new Date(2023, 6, 4),
        new Date(2023, 6, 5),
        new Date(2023, 6, 6),
        new Date(2023, 6, 7),
        new Date(2023, 6, 8),
        new Date(2023, 6, 9),
        new Date(2023, 6, 10),
        new Date(2023, 6, 11),
        new Date(2023, 6, 12),
        new Date(2023, 6, 13),
      ])
    })
  })

  describe('bedRows', () => {
    it('calls bedRow func for each item in the param array', () => {
      const startDate = new Date()
      const bedOccupancyRangeList = bedOccupancyRangeFactoryUi.buildList(2)

      expect(bedRows(bedOccupancyRangeList, startDate, premisesId)).toMatchStringIgnoringWhitespace(
        `${bedRow(bedOccupancyRangeList[0], startDate, premisesId)}${bedRow(
          bedOccupancyRangeList[1],
          startDate,
          premisesId,
        )}`,
      )
    })
  })

  describe('bedRow', () => {
    it('returns the markup for a row and calls generateRowCells', () => {
      const startDate = new Date()
      const bedOccupancyRange = bedOccupancyRangeFactoryUi.build()

      expect(bedRow(bedOccupancyRange, startDate, premisesId)).toMatchStringIgnoringWhitespace(
        `<tr class="${rowClass}" data-cy-bedId="${bedOccupancyRange.bedId}">
        <th scope="row" class="${headerClass}">${bedOccupancyRange.bedName}</th>
        ${generateRowCells(bedOccupancyRange, startDate, premisesId)}</tr>`,
      )
    })
  })

  describe('generateRowCells', () => {
    it('for each day from generateDays, calls cellText on every entry of the bedOccupancyRange.schedule array', () => {
      const startDate = new Date()
      const bedOccupancyRange = bedOccupancyRangeFactoryUi.build()
      const bedId = 'some-uuid'

      const schedule = scheduleForCalendar(bedOccupancyRange.schedule, startDate, premisesId, bedId)

      expect(generateRowCells(bedOccupancyRange, startDate, premisesId)).toMatchStringIgnoringWhitespace(
        `${generateDays(new Date())
          .map(day => schedule.map(entry => cell(day, entry)).join(''))
          .join('')}`,
      )
    })
  })

  describe('labelForScheduleItem', () => {
    const bedId = 'some-uuid'

    it('if the bedOccupancyEntry.type is open it returns the markup for an open cell', () => {
      const openBedOccupancyEntry = bedOccupancyEntryUiFactory.build({ type: 'open' })

      expect(labelForScheduleItem(openBedOccupancyEntry, premisesId, bedId)).toEqual(
        '<span class="govuk-visually-hidden">open</span>',
      )
    })

    it('if the bedOccupancyEntry.type is lost it returns the markup for a lost bed cell', () => {
      const lostBedOccupancyEntry = bedOccupancyEntryUiFactory.build({ type: 'lost_bed' })

      expect(labelForScheduleItem(lostBedOccupancyEntry, premisesId, bedId)).toEqual('Out of Service')
    })

    it('if the bedOccupancyEntry.type is booking it returns the markup for a booking cell', () => {
      const bedOccupancyEntry = bedOccupancyEntryUiFactory.build({ type: 'booking', bookingId: '123' })

      expect(labelForScheduleItem(bedOccupancyEntry, premisesId, bedId)).toEqual(
        bookingCellContent(bedOccupancyEntry, premisesId),
      )
    })

    it('if the bedOccupancyEntry.type is booking it returns the markup for an overbooked cell', () => {
      const bedOccupancyEntry = bedOccupancyEntryUiFactory.build({ type: 'overbooking' })

      expect(labelForScheduleItem(bedOccupancyEntry, premisesId, bedId)).toEqual(
        overbookedCellContent(premisesId, bedId),
      )
    })
  })

  describe('overbookedCellContent', () => {
    it('returns a link to the bed', () => {
      expect(overbookedCellContent('premises-uuid', 'bed-uuid')).toEqual(
        '<a href="/premises/premises-uuid/beds/bed-uuid" data-cy-bedId="bed-uuid" class="govuk-link govuk-link--overbooking">Overbooked</a>',
      )
    })
  })

  describe('scheduleForCalendar', () => {
    const bedId = 'some-uuid'

    it('adds labels to all the schedule items', () => {
      const startDate = new Date()
      const scheduleItems = [
        bedOccupancyEntryUiFactory.build({ type: 'open' }),
        bedOccupancyEntryUiFactory.build({ type: 'lost_bed' }),
        bedOccupancyEntryUiFactory.build({ type: 'booking', bookingId: '123' }),
      ]

      expect(scheduleForCalendar(scheduleItems, startDate, premisesId, bedId)).toEqual([
        {
          startDate: scheduleItems[0].startDate,
          endDate: scheduleItems[0].endDate,
          length: scheduleItems[0].length + 1,
          label: labelForScheduleItem(scheduleItems[0], premisesId, bedId),
          type: scheduleItems[0].type,
        },
        {
          startDate: scheduleItems[1].startDate,
          endDate: scheduleItems[1].endDate,
          length: scheduleItems[1].length + 1,
          label: labelForScheduleItem(scheduleItems[1], premisesId, bedId),
          type: scheduleItems[1].type,
        },
        {
          startDate: scheduleItems[2].startDate,
          endDate: scheduleItems[2].endDate,
          length: scheduleItems[2].length + 1,
          label: labelForScheduleItem(scheduleItems[2], premisesId, bedId),
          bookingId: '123',
          type: scheduleItems[2].type,
        },
      ])
    })

    it('changes the start dates to today if any start dates are before the start date', () => {
      const startDate = new Date()
      const scheduleItems = [
        bedOccupancyEntryUiFactory.build({
          startDate: subDays(startDate, 2),
          endDate: addDays(startDate, 5),
          type: 'booking',
          bookingId: '123',
        }),
      ]

      expect(scheduleForCalendar(scheduleItems, startDate, premisesId, bedId)).toEqual([
        {
          startDate,
          endDate: scheduleItems[0].endDate,
          length: 6,
          label: labelForScheduleItem(scheduleItems[0], premisesId, bedId),
          type: scheduleItems[0].type,
          bookingId: '123',
        },
      ])
    })

    it('changes the end dates to the end of the calendar if any end dates are after 30 days after the start date', () => {
      const startDate = new Date()
      const endDate = addDays(startDate, 30)
      const scheduleItems = [
        bedOccupancyEntryUiFactory.build({
          startDate: addDays(startDate, 10),
          endDate: addDays(endDate, 2),
          type: 'booking',
          bookingId: '123',
        }),
      ]

      expect(scheduleForCalendar(scheduleItems, startDate, premisesId, bedId)).toEqual([
        {
          startDate: scheduleItems[0].startDate,
          endDate: addDays(startDate, 30),
          length: differenceInDays(endDate, scheduleItems[0].startDate) + 1,
          label: labelForScheduleItem(scheduleItems[0], premisesId, bedId),
          type: scheduleItems[0].type,
          bookingId: '123',
        },
      ])
    })
  })

  describe('cell', () => {
    it('the start date is not the same as the cell date it returns an empty string', () => {
      const bedOccupancyEntry = bedOccupancyEntryCalendarFactory.build({ startDate: addDays(new Date(), 1) })

      expect(cell(new Date(), bedOccupancyEntry)).toEqual('')
    })

    it('if the start date is the same as the cell date it returns the markup for a cell', () => {
      const bedOccupancyEntry = bedOccupancyEntryCalendarFactory.build({ startDate: new Date() })

      expect(cell(new Date(), bedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        wrapCellContentInTableCellMarkup(bedOccupancyEntry),
      )
    })
  })

  describe('wrapCellContentInTableCellMarkup', () => {
    it('should return the cell content for a booking', () => {
      const bedOccupancyEntry = bedOccupancyEntryCalendarFactory.build({
        startDate: DateFormats.isoToDateObj('2023-06-22'),
        type: 'booking',
        length: 4,
        bookingId: '123',
      })

      expect(wrapCellContentInTableCellMarkup(bedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        `<td class="govuk-table__cell govuk-table__cell--calendar govuk-table__cell--booking" colspan="4" data-cy-startdate="2023-06-22" data-cy-id="123">Some text goes here</td>`,
      )
    })

    it('should return the cell content for a lost bed', () => {
      const bedOccupancyEntry = bedOccupancyEntryCalendarFactory.build({
        startDate: DateFormats.isoToDateObj('2023-06-22'),
        type: 'lost_bed',
        length: 4,
        lostBedId: '123',
      })

      expect(wrapCellContentInTableCellMarkup(bedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        `<td class="govuk-table__cell govuk-table__cell--calendar govuk-table__cell--lost_bed" colspan="4" data-cy-startdate="2023-06-22" data-cy-id="123">Some text goes here</td>`,
      )
    })

    it('should return the cell content for an open entry', () => {
      const bedOccupancyEntry = bedOccupancyEntryCalendarFactory.build({
        startDate: DateFormats.isoToDateObj('2023-06-22'),
        type: 'open',
        length: 4,
      })

      expect(wrapCellContentInTableCellMarkup(bedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        `<td class="govuk-table__cell govuk-table__cell--calendar govuk-table__cell--open" colspan="4" data-cy-startdate="2023-06-22" data-cy-id="">Some text goes here</td>`,
      )
    })

    it('should return the cell content for an overbooked entry', () => {
      const bedOccupancyEntry = bedOccupancyEntryCalendarFactory.build({
        startDate: DateFormats.isoToDateObj('2023-06-22'),
        type: 'overbooking',
        length: 4,
      })

      expect(wrapCellContentInTableCellMarkup(bedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        `<td class="govuk-table__cell govuk-table__cell--calendar govuk-table__cell--overbooking" colspan="4" data-cy-startdate="2023-06-22" data-cy-id="">Some text goes here</td>`,
      )
    })
  })

  describe('occupierName', () => {
    it('returns the markup for a booked bed cell', () => {
      const bookedBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({ bookingId: '123' })

      expect(occupierName(bookedBedOccupancyEntry, premisesId)).toBe(
        `<a href="/premises/some-uuid/bookings/123" data-cy-bookingId="123" class="govuk-link govuk-link--booking">${bookedBedOccupancyEntry.personName}</a>`,
      )
    })
  })

  describe('bookingCellContent', () => {
    it('returns the occupiers name if the booking length is less than 5 days', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        length: 4,
        startDate: new Date(),
        endDate: addDays(new Date(), 4),
      })

      expect(bookingCellContent(bookingBedOccupancyEntry, premisesId)).toBe(
        `<a href="/premises/some-uuid/bookings/${bookingBedOccupancyEntry.bookingId}" data-cy-bookingId="${bookingBedOccupancyEntry.bookingId}" class="govuk-link govuk-link--booking">${bookingBedOccupancyEntry.personName}</a>`,
      )
    })

    it('returns the occupiers name and length of stay in words if the booking length is 5 or more days and less than 10 days', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        length: 5,
        startDate: new Date(),
        endDate: addDays(new Date(), 5),
      })

      expect(bookingCellContent(bookingBedOccupancyEntry, premisesId)).toBe(
        `<a href="/premises/some-uuid/bookings/${bookingBedOccupancyEntry.bookingId}" data-cy-bookingId="${bookingBedOccupancyEntry.bookingId}" class="govuk-link govuk-link--booking">${bookingBedOccupancyEntry.personName}</a> (5 days)`,
      )
    })

    it('returns the occupiers name, length of stay in words and the start and end date if the booking length is more than 10 days', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        length: 10,
        startDate: new Date(2023, 5, 21),
        endDate: addDays(new Date(), 11),
      })

      expect(bookingCellContent(bookingBedOccupancyEntry, premisesId)).toBe(
        `<a href="/premises/some-uuid/bookings/${bookingBedOccupancyEntry.bookingId}" data-cy-bookingId="${bookingBedOccupancyEntry.bookingId}" class="govuk-link govuk-link--booking">${bookingBedOccupancyEntry.personName}</a> (12 days 21/06/2023 - 02/07/2023)`,
      )
    })
  })
})
