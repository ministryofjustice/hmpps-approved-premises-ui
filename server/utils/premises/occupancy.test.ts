import type { SelectOption } from '@approved-premises/ui'
import {
  Cas1OutOfServiceBedSummary,
  Cas1PremiseCapacityForDay,
  type Cas1SpaceBookingCharacteristic,
  Cas1SpaceBookingSummary,
} from '@approved-premises/api'
import {
  cas1OutOfServiceBedSummaryFactory,
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesDaySummaryFactory,
  cas1SpaceBookingSummaryFactory,
} from '../../testutils/factories'
import {
  ColumnDefinition,
  dayStatusFromDayCapacity,
  daySummaryRows,
  durationSelectOptions,
  filterOutOfServiceBeds,
  generateCharacteristicsSummary,
  generateDaySummaryText,
  occupancyCalendar,
  outOfServiceBedTableRows,
  placementTableRows,
  tableCaptions,
  tableHeader,
} from './occupancy'
import { DateFormats } from '../dateUtils'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'
import { getTierOrBlank } from '../applications/helpers'
import { displayName } from '../personUtils'
import config from '../../config'
import { roomCharacteristicMap } from '../characteristicsUtils'
import { sortHeader } from '../sortHeader'
import { canonicalDates } from '../placements'

describe('apOccupancy utils', () => {
  describe('dayStatusFromDayCapacity', () => {
    it('Returns the overall day status, to determine colouration, from a day capacity', () => {
      const availableCharacteristics = premiseCharacteristicAvailability.available().buildList(3)
      const overbookedCharacteristics = [
        ...availableCharacteristics,
        premiseCharacteristicAvailability.overbooked().build(),
      ]
      const testData: Record<string, Cas1PremiseCapacityForDay> = {
        available: cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 10,
          bookingCount: 0,
          characteristicAvailability: availableCharacteristics,
        }),
        overbooked: cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 10,
          bookingCount: 15,
          characteristicAvailability: availableCharacteristics,
        }),
        full: cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 10,
          bookingCount: 10,
          characteristicAvailability: availableCharacteristics,
        }),
        overbookedOnCharacteristics: cas1PremiseCapacityForDayFactory.build({
          availableBedCount: 10,
          bookingCount: 10,
          characteristicAvailability: overbookedCharacteristics,
        }),
      }
      expect(dayStatusFromDayCapacity(testData.available)).toEqual('available')
      expect(dayStatusFromDayCapacity(testData.overbooked)).toEqual('overbooked')
      expect(dayStatusFromDayCapacity(testData.full)).toEqual('full')
      expect(dayStatusFromDayCapacity(testData.overbookedOnCharacteristics)).toEqual('overbooked')
    })
  })

  describe('occupancyCalendar', () => {
    it('converts the premises capacity to a calendar', () => {
      const capacity = cas1PremiseCapacityFactory.build({ startDate: '2024-12-01', endDate: '2024-12-07' })
      const premisesId = 'test-premises-id'
      const calendar = occupancyCalendar(capacity.capacity, premisesId)
      calendar.forEach(month => {
        expect(month.name).toEqual('December 2024')
        month.days.forEach((day, index) => {
          const { date, availableBedCount, bookingCount, characteristicAvailability } = capacity.capacity[index]
          const characteristicOverbooking = characteristicAvailability.reduce(
            (overBooked, { availableBedsCount, bookingsCount }) => overBooked || bookingsCount > availableBedsCount,
            false,
          )
          let expectedStatus = availableBedCount < bookingCount ? 'overbooked' : 'available'
          expectedStatus = availableBedCount === bookingCount ? 'full' : expectedStatus
          expectedStatus = characteristicOverbooking ? 'overbooked' : expectedStatus
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
      const characteristicAvailability = Object.keys(roomCharacteristicMap).map(characteristic =>
        overbookedCharacteristics.includes(characteristic as Cas1SpaceBookingCharacteristic)
          ? premiseCharacteristicAvailability
              .overbooked()
              .build({ characteristic: characteristic as Cas1SpaceBookingCharacteristic })
          : premiseCharacteristicAvailability
              .available()
              .build({ characteristic: characteristic as Cas1SpaceBookingCharacteristic }),
      )
      const capacityForDay = overbook
        ? cas1PremiseCapacityForDayFactory.overbooked().build({
            characteristicAvailability,
          })
        : cas1PremiseCapacityForDayFactory.available().build({
            characteristicAvailability,
          })
      return capacityForDay
    }

    it('should generate the text for an premises day with an overbooking on a single characteristic', () => {
      const characteristicAvailability = buildDaySummary(['isSingle'])
      expect(generateDaySummaryText(characteristicAvailability)).toEqual('This AP is overbooked on: single room.')
    })

    it('should generate the text for an premises day with an overbooking on multiple characteristics', () => {
      const characteristicAvailability = buildDaySummary(['isSingle', 'isArsonSuitable', 'isWheelchairDesignated'])
      expect(generateDaySummaryText(characteristicAvailability)).toEqual(
        'This AP is overbooked on: wheelchair accessible, single room and suitable for active arson risk.',
      )
    })

    it('should generate the text for an premises day with an overall overbooking but no overbooked characteristics', () => {
      const characteristicAvailability = buildDaySummary([], true)
      expect(generateDaySummaryText(characteristicAvailability)).toEqual('This AP is overbooked.')
    })

    it('should generate the text for an premises day with an overall overbooking and overbooked characteristics', () => {
      const characteristicAvailability = buildDaySummary(['isSingle', 'isArsonSuitable'], true)
      expect(generateDaySummaryText(characteristicAvailability)).toEqual(
        'This AP is overbooked and is overbooked on: single room and suitable for active arson risk.',
      )
    })

    it('should generate empty text for an premises day with no overbooked characteristics', () => {
      const characteristicAvailability = buildDaySummary([])
      expect(generateDaySummaryText(characteristicAvailability)).toEqual('')
    })
  })

  describe('daySummaryRows', () => {
    const emptyRow = {
      key: { html: `<div class="govuk-!-static-padding-top-5"></div>` },
      value: null as { text: string },
    }
    const dayCapacity = cas1PremiseCapacityForDayFactory.build({
      date: '2025-02-02',
      totalBedCount: 20,
      availableBedCount: 18,
      bookingCount: 21,
      characteristicAvailability: [
        premiseCharacteristicAvailability.build({
          characteristic: 'hasEnSuite',
          availableBedsCount: 1,
          bookingsCount: 2,
        }),
        premiseCharacteristicAvailability.build({
          characteristic: 'isWheelchairDesignated',
          availableBedsCount: 2,
          bookingsCount: 1,
        }),
        premiseCharacteristicAvailability.build({
          characteristic: 'isStepFreeDesignated',
          availableBedsCount: 1,
          bookingsCount: 1,
        }),
        premiseCharacteristicAvailability.build({
          characteristic: 'isSingle',
          availableBedsCount: 0,
          bookingsCount: 0,
        }),
      ],
    })
    const totalsBlock = [
      { key: { text: 'Capacity' }, value: { text: '20' } },
      { key: { text: 'Booked spaces' }, value: { text: '21' } },
      { key: { text: 'Out of service beds' }, value: { text: '2' } },
      { key: { text: 'Available spaces' }, value: { text: '-3' } },
    ]

    it('should generate a list of day summary rows when no criteria are provided', () => {
      expect(daySummaryRows(dayCapacity)).toEqual({
        rows: totalsBlock,
      })
    })

    it('should generate a list of day summary rows including criteria', () => {
      const expected = [
        ...totalsBlock,
        emptyRow,
        { key: { text: 'En-suite bathroom capacity' }, value: { text: '1' } },
        { key: { text: 'En-suite bathroom available' }, value: { text: '-1' } },
        { key: { text: 'Step-free access capacity' }, value: { text: '1' } },
        { key: { text: 'Step-free access available' }, value: { text: '0' } },
      ]
      expect(daySummaryRows(dayCapacity, ['hasEnSuite', 'isStepFreeDesignated'], 'doubleRow')).toEqual({
        rows: expected,
      })
    })

    it('should generate a list of day summary rows in single-row/criterion mode', () => {
      const expected = [
        ...totalsBlock,
        {
          key: { text: 'En-suite bathroom' },
          value: {
            html: '<div class="govuk-grid-row govuk-grid-row--flex"><div class="govuk-grid-column-one-third">1 capacity</div><div class="govuk-grid-column-one-third">2 booked</div><div class="govuk-grid-column-one-third">-1 available</div></div>',
          },
        },
        {
          key: { text: 'Step-free access' },
          value: {
            html: '<div class="govuk-grid-row govuk-grid-row--flex"><div class="govuk-grid-column-one-third">1 capacity</div><div class="govuk-grid-column-one-third">1 booked</div><div class="govuk-grid-column-one-third">0 available</div></div>',
          },
        },
        {
          key: { text: 'Single room' },
          value: {
            html: '<div class="govuk-grid-row govuk-grid-row--flex"><div class="govuk-grid-column-one-third">0 capacity</div><div class="govuk-grid-column-one-third">0 booked</div><div class="govuk-grid-column-one-third">0 available</div></div>',
          },
        },
      ]
      expect(daySummaryRows(dayCapacity, ['hasEnSuite', 'isStepFreeDesignated', 'isSingle'], 'singleRow')).toEqual({
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
        sortHeader('Col 1', 'fn1', null, null, prefix),
        { text: 'Col 2' },
      ])
    })
    it('should render a data table header with a sorted column', () => {
      const tableDefinition: Array<ColumnDefinition<FieldName>> = [
        { title: 'Col 1', fieldName: 'fn1', sortable: true },
        { title: 'Col 2', fieldName: 'fn2', sortable: false },
      ]
      expect(tableHeader(tableDefinition, 'fn1', 'asc', prefix)).toEqual([
        sortHeader('Col 1', 'fn1', 'fn1', 'asc', prefix),
        { text: 'Col 2' },
      ])
    })
  })

  describe('placementTableRows', () => {
    const checkRow = (placement: Cas1SpaceBookingSummary, row: Array<{ text?: string; html?: string }>) => {
      const { arrivalDate, departureDate } = canonicalDates(placement)

      expect(row[0].html).toMatchStringIgnoringWhitespace(
        `<a href="/manage/premises/premises-Id/placements/${placement.id}" data-cy-id="${placement.id}">${displayName(placement.person)}, ${placement.person.crn}</a>`,
      )
      expect(row[1].html).toEqual(getTierOrBlank(placement.tier))
      expect(row[2].text).toEqual(DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }))
      expect(row[3].text).toEqual(DateFormats.isoDateToUIDate(departureDate, { format: 'short' }))
      expect(row[4].html).toMatchStringIgnoringWhitespace(
        `<ul class="govuk-list govuk-list--compact"><li>Suitable for active arson risk</li></ul>`,
      )
    }
    it('should generate a list of placement table rows', () => {
      const placements = cas1SpaceBookingSummaryFactory.buildList(5, {
        characteristics: ['isArsonSuitable'],
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
      expect(row[4].html).toMatchStringIgnoringWhitespace(`<ul class="govuk-list govuk-list--compact">
        ${summary.characteristics.map((characteristic: Cas1SpaceBookingCharacteristic) => `<li>${roomCharacteristicMap[characteristic]}</li>`).join('')}
      </ul>`)
    }

    it('should generate a list of out of service beds', () => {
      const outOfServiceBeds = cas1OutOfServiceBedSummaryFactory.buildList(5)
      const rows = outOfServiceBedTableRows('premises-Id', outOfServiceBeds)
      outOfServiceBeds.forEach((summary, index) => checkRow(summary, rows[index]))
    })
  })

  describe('tableCaptions', () => {
    const daySummary = cas1PremisesDaySummaryFactory.build({ forDate: '2025-02-12' })

    afterEach(() => {
      config.flags.pocEnabled = false
    })

    it('should generate table captions', () => {
      const captions = tableCaptions(daySummary, ['isArsonSuitable'])
      expect(captions).toEqual({
        outOfServiceBedCaption: 'Out of service beds on Wed 12 Feb 2025',
        placementTableCaption: 'People booked in on Wed 12 Feb 2025',
      })
    })

    it('should generate detailed table captions with no characteristics', () => {
      const captions = tableCaptions(daySummary, [], true)
      expect(captions).toEqual({
        outOfServiceBedCaption: '4 out of service beds on Wed 12 Feb 2025',
        placementTableCaption: '5 people booked in on Wed 12 Feb 2025',
      })
    })

    it('should generate POC table captions with characteristics', () => {
      const captions = tableCaptions(daySummary, ['isArsonSuitable', 'isStepFreeDesignated'], true)
      expect(captions).toEqual({
        outOfServiceBedCaption:
          '4 out of service beds on Wed 12 Feb 2025 with: suitable for active arson risk and step-free',
        placementTableCaption:
          '5 people booked in on Wed 12 Feb 2025 requiring: suitable for active arson risk and step-free',
      })
    })

    it('should generate singular table captions', () => {
      const captions = tableCaptions(
        {
          ...daySummary,
          spaceBookingSummaries: cas1SpaceBookingSummaryFactory.buildList(1),
          outOfServiceBeds: cas1OutOfServiceBedSummaryFactory.buildList(1),
        },
        [],
        true,
      )
      expect(captions).toEqual({
        outOfServiceBedCaption: '1 out of service bed on Wed 12 Feb 2025',
        placementTableCaption: '1 person booked in on Wed 12 Feb 2025',
      })
    })
  })
})

describe('generateCharacteristicsSummary', () => {
  it('should render a prefixed list of characteristics', () => {
    expect(generateCharacteristicsSummary(['isSingle', 'isArsonSuitable'], ' prefix ')).toEqual(
      ' prefix single room and suitable for active arson risk',
    )
  })
})

describe('filterOutOfServiceBeds', () => {
  const outOfServiceBeds = [
    cas1OutOfServiceBedSummaryFactory.build({ characteristics: ['isStepFreeDesignated'] }),
    cas1OutOfServiceBedSummaryFactory.build({ characteristics: ['isArsonSuitable', 'isStepFreeDesignated'] }),
  ]
  const daySummary = cas1PremisesDaySummaryFactory.build({ forDate: '2025-02-12', outOfServiceBeds })
  it('should filter the oosb list in a day summary based on characteristics', () => {
    const filtered = filterOutOfServiceBeds(daySummary, ['isArsonSuitable'])
    expect(filtered.outOfServiceBeds).toEqual([outOfServiceBeds[1]])
  })
})
