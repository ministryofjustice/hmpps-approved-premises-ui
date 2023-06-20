import { addDays } from 'date-fns'
import {
  bedOccupancyEntryBookingUiFactory,
  bedOccupancyEntryUiFactory,
  bedOccupancyRangeFactoryUi,
} from '../testutils/factories'

import {
  bedRow,
  bedRows,
  bookingCellContent,
  calendar,
  cell,
  dateRow,
  formatDaysForDateRow,
  generateDays,
  generateRowCells,
  occupierName,
  wrapCellContentInTableCellMarkup,
} from './calendarUtils'
import {} from '../testutils/factories/bedOccupancyRange'

describe('calendarUtils', () => {
  describe('calendar', () => {
    it('should return calendar', () => {
      const bedOccupancyRangeList = bedOccupancyRangeFactoryUi.buildList(1)
      expect(calendar(bedOccupancyRangeList)).toMatchStringIgnoringWhitespace(
        `<table cellspacing="0">
        <thead>${dateRow()}</thead>
        <tbody>${bedRows(bedOccupancyRangeList)}</tbody>
      </table>`,
      )
    })
  })

  describe('dateRow', () => {
    it('should return dateRow', () => {
      expect(dateRow()).toMatchStringIgnoringWhitespace(`<th>Room/Bed</th>
      ${formatDaysForDateRow(new Date())}`)
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
      const bedOccupancyRangeList = bedOccupancyRangeFactoryUi.buildList(2)
      expect(bedRows(bedOccupancyRangeList)).toMatchStringIgnoringWhitespace(
        `${bedRow(bedOccupancyRangeList[0])}${bedRow(bedOccupancyRangeList[1])}`,
      )
    })
  })

  describe('bedRow', () => {
    it('returns the markup for a row and calls generateRowCells', () => {
      const bedOccupancyRange = bedOccupancyRangeFactoryUi.build()
      expect(bedRow(bedOccupancyRange)).toMatchStringIgnoringWhitespace(
        `<tr>
        <th scope="row">${bedOccupancyRange.bedName}</th>
        ${generateRowCells(bedOccupancyRange)}</tr>`,
      )
    })
  })

  describe('generateRowCells', () => {
    it('for each day from generateDays, calls cellText on every entry of the bedOccupancyRange.schedule array', () => {
      const bedOccupancyRange = bedOccupancyRangeFactoryUi.build()

      expect(generateRowCells(bedOccupancyRange)).toMatchStringIgnoringWhitespace(
        `${generateDays(new Date())
          .map(day => bedOccupancyRange.schedule.map(entry => cell(day, entry)).join(''))
          .join('')}`,
      )
    })
  })

  describe('cell', () => {
    it('the start date is not the same as the cell date it returns an empty string', () => {
      const bedOccupancyEntry = bedOccupancyEntryUiFactory.build({ startDate: addDays(new Date(), 1) })

      expect(cell(new Date(), bedOccupancyEntry)).toEqual('')
    })

    it('if the bedOccupancyEntry.type is open and the start date is the same as the cell date it returns the markup for an open cell', () => {
      const openBedOccupancyEntry = bedOccupancyEntryUiFactory.build({ type: 'open', startDate: new Date() })

      expect(cell(new Date(), openBedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        wrapCellContentInTableCellMarkup(openBedOccupancyEntry.length, 'open'),
      )
    })

    it('if the bedOccupancyEntry.type is lost it returns the markup for a lost bed cell', () => {
      const lostBedOccupancyEntry = bedOccupancyEntryUiFactory.build({ type: 'lost_bed', startDate: new Date() })

      expect(cell(new Date(), lostBedOccupancyEntry)).toMatchStringIgnoringWhitespace(
        wrapCellContentInTableCellMarkup(lostBedOccupancyEntry.length, 'lost'),
      )
    })

    it('if the bedOccupancyEntry.type is booking and the start date is the same as the cell date it returns the markup for a booked bed cell', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        type: 'booking',
        startDate: new Date(),
        length: 1,
      })

      expect(cell(new Date(), bookingBedOccupancyEntry)).toEqual(
        wrapCellContentInTableCellMarkup(bookingBedOccupancyEntry.length, occupierName(bookingBedOccupancyEntry)),
      )
    })
  })

  describe('occupierName', () => {
    it('returns the markup for a booked bed cell', () => {
      const bookedBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build()

      expect(occupierName(bookedBedOccupancyEntry)).toBe(bookedBedOccupancyEntry.personName)
    })
  })

  describe('bookingCellContent', () => {
    it('returns the occupiers name if the booking length is less than 5 days', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        length: 4,
        startDate: new Date(),
        endDate: addDays(new Date(), 4),
      })

      expect(bookingCellContent(bookingBedOccupancyEntry)).toBe(bookingBedOccupancyEntry.personName)
    })

    it('returns the occupiers name and length of stay in words if the booking length is 5 or more days and less than 10 days', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        length: 5,
        startDate: new Date(),
        endDate: addDays(new Date(), 5),
      })

      expect(bookingCellContent(bookingBedOccupancyEntry)).toBe(`${bookingBedOccupancyEntry.personName} (5 days)`)
    })

    it('returns the occupiers name, length of stay in words and the start and end date if the booking length is more than 10 days', () => {
      const bookingBedOccupancyEntry = bedOccupancyEntryBookingUiFactory.build({
        length: 10,
        startDate: new Date(2023, 5, 21),
        endDate: addDays(new Date(), 11),
      })

      expect(bookingCellContent(bookingBedOccupancyEntry)).toBe(
        `${bookingBedOccupancyEntry.personName} (10 days 21/06/2023 - 01/07/2023)`,
      )
    })
  })
})
