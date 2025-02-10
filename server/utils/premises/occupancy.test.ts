import type { SelectOption } from '@approved-premises/ui'
import {
  Cas1OutOfServiceBedSummary,
  type Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingDaySummary,
} from '@approved-premises/api'
import {
  cas1OutOfServiceBedSummaryFactory,
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesDaySummaryFactory,
  cas1SpaceBookingDaySummaryFactory,
} from '../../testutils/factories'
import {
  ColumnDefinition,
  daySummaryRows,
  durationSelectOptions,
  generateDaySummaryText,
  occupancyCalendar,
  outOfServiceBedTableRows,
  placementTableRows,
  tableHeader,
} from './occupancy'
import { DateFormats } from '../dateUtils'
import { occupancyCriteriaMap } from '../match/occupancy'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'
import { getTierOrBlank } from '../applications/helpers'
import { laoSummaryName } from '../personUtils'
import { spaceSearchCriteriaRoomLevelLabels } from '../match/spaceSearch'
import { capacityWithCriteria } from '../match/occupancy.test'

describe('apOccupancy utils', () => {
  describe('occupancyCalendar', () => {
    it('converts the premises capacity to a calendar', () => {
      const capacity = cas1PremiseCapacityFactory.build({ startDate: '2024-12-01', endDate: '2024-12-07' })
      const premisesId = 'test-premises-id'
      const calendar = occupancyCalendar(capacity.capacity, premisesId)
      calendar.forEach(month => {
        expect(month.name).toEqual('December 2024')
        month.days.forEach((day, index) => {
          const { date, availableBedCount, bookingCount } = capacity.capacity[index]
          let expectedStatus = availableBedCount < bookingCount ? 'overbooked' : 'available'
          expectedStatus = availableBedCount === bookingCount ? 'full' : expectedStatus
          expect(day).toEqual({
            link: `/manage/premises/test-premises-id/occupancy/day/${date}`,
            availability: availableBedCount - bookingCount,
            booked: bookingCount,
            name: DateFormats.isoDateToUIDate(date, { format: 'longNoYear' }),
            status: expectedStatus,
          })
        })
      })
    })
  })
  const durationOptions: Array<SelectOption> = [
    { selected: undefined, text: '1 week', value: '7' },
    { selected: undefined, text: '6 weeks', value: '42' },
    { selected: undefined, text: '8 weeks', value: '56' },
    { selected: undefined, text: '12 weeks', value: '84' },
    { selected: undefined, text: '26 weeks', value: '182' },
    { selected: undefined, text: '52 weeks', value: '364' },
  ]

  describe('durationSelectOptions', () => {
    it('should return the set of duration periods', () => {
      expect(durationSelectOptions()).toEqual(durationOptions)
    })

    it('should select the option matching the supplied duration', () => {
      expect(durationSelectOptions('26')).toEqual(
        durationOptions.map(option => (option.value === '26' ? { ...option, selected: true } : option)),
      )
    })
    it('should not select an option if there is no matching value', () => {
      expect(durationSelectOptions('27')).toEqual(durationOptions)
    })
  })

  describe('generateDaySummaryText', () => {
    const buildDaySummary = (overbookedCharacteristics: Array<Cas1SpaceBookingCharacteristic>, overbook = false) => {
      const characteristicAvailability = Object.keys(occupancyCriteriaMap).map(characteristic =>
        overbookedCharacteristics.includes(characteristic as Cas1SpaceBookingCharacteristic)
          ? premiseCharacteristicAvailability
              .strictlyOverbooked()
              .build({ characteristic: characteristic as Cas1SpaceBookingCharacteristic })
          : premiseCharacteristicAvailability
              .available()
              .build({ characteristic: characteristic as Cas1SpaceBookingCharacteristic }),
      )
      const capacityForDay = overbook
        ? cas1PremiseCapacityForDayFactory.strictlyOverbooked().build({
            characteristicAvailability,
          })
        : cas1PremiseCapacityForDayFactory.available().build({
            characteristicAvailability,
          })
      return cas1PremisesDaySummaryFactory.build({
        capacity: capacityForDay,
      })
    }

    it('should generate the text for an premises day with an overbooking on a single characteristic', () => {
      const characteristicAvailability = buildDaySummary(['isSingle'])
      expect(generateDaySummaryText(characteristicAvailability)).toEqual(
        'This AP is overbooked on spaces with the following criterion: single room.',
      )
    })

    it('should generate the text for an premises day with an overbooking on multiple characteristics', () => {
      const characteristicAvailability = buildDaySummary(['isSingle', 'isArsonSuitable', 'isWheelchairDesignated'])
      expect(generateDaySummaryText(characteristicAvailability)).toEqual(
        'This AP is overbooked on spaces with the following criteria: wheelchair accessible, single room, designated arson room.',
      )
    })

    it('should generate the text for an premises day with an overall overbooking but no overbooked characteristics', () => {
      const characteristicAvailability = buildDaySummary([], true)
      expect(generateDaySummaryText(characteristicAvailability)).toEqual(
        'This AP has bookings exceeding its available capacity.',
      )
    })

    it('should generate the text for an premises day with an overall overbooking and overbooked characteristics', () => {
      const characteristicAvailability = buildDaySummary(['isSingle', 'isArsonSuitable'], true)
      expect(generateDaySummaryText(characteristicAvailability)).toEqual(
        'This AP has bookings exceeding its available capacity and is overbooked on spaces with the following criteria: single room, designated arson room.',
      )
    })

    it('should generate empty text for an premises day with no overbooked characteristics', () => {
      const characteristicAvailability = buildDaySummary([])
      expect(generateDaySummaryText(characteristicAvailability)).toEqual('')
    })
  })

  describe('daySummaryRows', () => {
    it('should generate a list of day summary rows when no criteria are provided', () => {
      const daySummary = cas1PremisesDaySummaryFactory.build({
        capacity: capacityWithCriteria,
      })
      const expected = [
        { key: { text: 'Capacity' }, value: { text: '20' } },
        { key: { text: 'Booked spaces' }, value: { text: '21' } },
        { key: { text: 'Out of service beds' }, value: { text: '2' } },
        { key: { text: 'Available spaces' }, value: { text: '-3' } },
      ]

      expect(daySummaryRows(daySummary)).toEqual({
        rows: expected,
      })
    })

    it('should generate a list of day summary rows including criteria', () => {
      const daySummary = cas1PremisesDaySummaryFactory.build({
        capacity: capacityWithCriteria,
      })
      const expected = [
        { key: { text: 'Capacity' }, value: { text: '20' } },
        { key: { text: 'Booked spaces' }, value: { text: '21' } },
        { key: { text: 'Out of service beds' }, value: { text: '2' } },
        { key: { text: 'Available spaces' }, value: { text: '-3' } },
        { key: { html: `<div class="govuk-!-static-padding-top-5"></div>` },value:{text:''} },
        { key: { text: 'En-suite bathroom capacity' }, value: { text: '1' } },
        { key: { text: 'En-suite bathroom available' }, value: { text: '-1' } },
        { key: { text: 'Step-free access capacity' }, value: { text: '1' } },
        { key: { text: 'Step-free access available' }, value: { text: '0' } },
      ]
      expect(daySummaryRows(daySummary, ['hasEnSuite', 'isStepFreeDesignated'], 'doubleRow')).toEqual({
        rows: expected,
      })
    })

    it('should generate a list of day summary rows in single-row/criterion mode', () => {
      const daySummary = cas1PremisesDaySummaryFactory.build({
        capacity: capacityWithCriteria,
      })
      const expected = [
        { key: { text: 'Capacity' }, value: { text: '20' } },
        { key: { text: 'Booked spaces' }, value: { text: '21' } },
        { key: { text: 'Out of service beds' }, value: { text: '2' } },
        { key: { text: 'Available spaces' }, value: { text: '-3' } },
        { key: { html: `<div class="govuk-!-static-padding-top-5"></div>` },value:{text:''} },
        {
          key: { text: 'En-suite bathroom' },
          value: {
            html: `1 bed<span class="govuk-!-padding-right-2"></span><a href="?characteristics=hasEnSuite"> 2 bookings</a> <strong class="govuk-tag govuk-tag--red govuk-tag--float-right">Overbooked</strong>`,
          },
        },
        {
          key: { text: 'Step-free access' },
          value: {
            html: `1 bed<span class="govuk-!-padding-right-2"></span><a href="?characteristics=isStepFreeDesignated\"> 1 booking</a> <strong class="govuk-tag govuk-tag--yellow govuk-tag--float-right">Full</strong>`,
          },
        },
      ]
      expect(daySummaryRows(daySummary, ['hasEnSuite', 'isStepFreeDesignated'], 'singleRow')).toEqual({
        rows: expected,
      })
    })
  })

  describe('tableHeader', () => {
    const prefix: string = 'prefix'
    type FieldName = 'fn1' | 'fn2'
    it('should render a data table header', () => {
      const tableDefinition: Array<ColumnDefinition<FieldName>> = [
        { title: 'Col 1', fieldName: 'fn1', sortable: true },
        { title: 'Col 2', fieldName: 'fn2', sortable: false },
      ]
      expect(tableHeader(tableDefinition, null, null, prefix)).toEqual([
        {
          attributes: { 'aria-sort': 'none', 'data-cy-sort-field': 'fn1' },
          html: '<a href="prefix?sortBy=fn1">Col 1</a>',
        },
        { text: 'Col 2' },
      ])
    })
    it('should render a data table header with a sorted column', () => {
      const tableDefinition: Array<ColumnDefinition<FieldName>> = [
        { title: 'Col 1', fieldName: 'fn1', sortable: true },
        { title: 'Col 2', fieldName: 'fn2', sortable: false },
      ]
      expect(tableHeader(tableDefinition, 'fn1', 'asc', prefix)).toEqual([
        {
          attributes: { 'aria-sort': 'ascending', 'data-cy-sort-field': 'fn1' },
          html: '<a href="prefix?sortBy=fn1&sortDirection=desc">Col 1</a>',
        },
        { text: 'Col 2' },
      ])
    })
  })

  describe('placementTableRows', () => {
    const checkRow = (placement: Cas1SpaceBookingDaySummary, row: Array<{ text?: string; html?: string }>) => {
      expect(row[0].html).toMatchStringIgnoringWhitespace(
        `<a href="/manage/premises/premises-Id/placements/${placement.id}" data-cy-id="${placement.id}">${laoSummaryName(placement.person)}, ${placement.person.crn}</a>`,
      )
      expect(row[1].html).toEqual(getTierOrBlank(placement.tier))
      expect(row[2].text).toEqual(DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' }))
      expect(row[3].text).toEqual(DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' }))
      expect(row[4].text).toEqual(placement.releaseType)
      expect(row[5].html).toMatchStringIgnoringWhitespace(`<ul class="govuk-list govuk-list"><li>Arson room</li></ul>`)
    }
    it('should generate a list of placement table rows', () => {
      const placements = cas1SpaceBookingDaySummaryFactory.buildList(5, {
        essentialCharacteristics: ['isArsonSuitable'],
      })
      const rows = placementTableRows('premises-Id', placements)
      placements.forEach((placement, index) => checkRow(placement, rows[index]))
    })
  })

  describe('outOfServiceBedTableRows', () => {
    const checkRow = (summary: Cas1OutOfServiceBedSummary, row: Array<{ text?: string; html?: string }>) => {
      expect(row[0].html).toMatchStringIgnoringWhitespace(
        `<a href="/manage/premises/premises-Id/beds/${summary.bedId}/out-of-service-beds/${summary.id}/details" data-cy-id="${summary.id}">${summary.roomName}</a>`,
      )
      expect(row[1].text).toEqual(summary.reason.name)
      expect(row[2].text).toEqual(DateFormats.isoDateToUIDate(summary.startDate, { format: 'short' }))
      expect(row[3].text).toEqual(DateFormats.isoDateToUIDate(summary.endDate, { format: 'short' }))
      expect(row[4].html).toMatchStringIgnoringWhitespace(`<ul class="govuk-list govuk-list">
        ${summary.characteristics.map((characteristic: Cas1SpaceBookingCharacteristic) => `<li>${spaceSearchCriteriaRoomLevelLabels[characteristic]}</li>`).join('')}
      </ul>`)
    }

    it('should generate a list of out of service beds', () => {
      const outOfServiceBeds = cas1OutOfServiceBedSummaryFactory.buildList(5)
      const rows = outOfServiceBedTableRows('premises-Id', outOfServiceBeds)
      outOfServiceBeds.forEach((summary, index) => checkRow(summary, rows[index]))
    })
  })

  // describe('dayAvailabilitySummaryListItems', () => {
  //   describe('when no criteria are provided', () => {
  //     it('returns a summary list with main availability for the day', () => {
  //       const summaryList = dayAvailabilitySummaryListItems(capacityWithCriteria)
  //
  //       expect(summaryList).toEqual([
  //         { key: { text: 'AP capacity' }, value: { text: '20' } },
  //         { key: { text: 'Booked spaces' }, value: { text: '21' } },
  //         { key: { text: 'Available spaces' }, value: { text: '-3' } },
  //       ])
  //     })
  //   })
  //
  //   describe('when criteria are provided', () => {
  //     it('returns a summary list with detailed availability for the selected criteria', () => {
  //       const summaryList = dayAvailabilitySummaryListItems(capacityWithCriteria, [
  //         'isSuitedForSexOffenders',
  //         'isStepFreeDesignated',
  //       ])
  //
  //       expect(summaryList).toEqual([
  //         { key: { text: 'AP capacity' }, value: { text: '20' } },
  //         { key: { text: 'Booked spaces' }, value: { text: '21' } },
  //         { key: { text: 'Suitable for sex offenders spaces available' }, value: { text: '3' } },
  //         { key: { text: 'Step-free spaces available' }, value: { text: '0' } },
  //       ])
  //     })
  //   })
  // })
})
