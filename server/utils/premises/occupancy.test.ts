import type { SelectOption } from '@approved-premises/ui'
import { cas1PremiseCapacityFactory } from '../../testutils/factories'
import { durationSelectOptions, occupancyCalendar } from './occupancy'
import { DateFormats } from '../dateUtils'

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
            link: `/manage/premises/test-premises-id/occupancy/day?date=${date}`,
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
})
