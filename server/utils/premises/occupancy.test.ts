import type { SelectOption } from '@approved-premises/ui'
import { type Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import {
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesDaySummaryFactory,
} from '../../testutils/factories'
import { daySummaryRows, durationSelectOptions, generateDaySummaryText, occupancyCalendar } from './occupancy'
import { DateFormats } from '../dateUtils'
import { occupancyCriteriaMap } from '../match/occupancy'
import { premiseCharacteristicAvailability } from '../../testutils/factories/cas1PremiseCapacity'

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
        ? cas1PremiseCapacityForDayFactory.overbooked().build({
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
    it('should generate a list of day summary rows', () => {
      const capacityForDay = cas1PremiseCapacityForDayFactory.build({
        totalBedCount: 20,
        availableBedCount: 18,
        bookingCount: 6,
      })
      const daySummary = cas1PremisesDaySummaryFactory.build({
        capacity: capacityForDay,
      })
      const expected = [
        { key: { text: 'Capacity' }, value: { text: '20' } },
        { key: { text: 'Booked spaces' }, value: { text: '6' } },
        { key: { text: 'Out of service beds' }, value: { text: '2' } },
        { key: { text: 'Available spaces' }, value: { text: '12' } },
      ]

      expect(daySummaryRows(daySummary)).toEqual({
        rows: expected,
      })
    })
  })
})
