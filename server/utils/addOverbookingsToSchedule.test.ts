import { differenceInDays } from 'date-fns'
import { BedOccupancyEntryUiType } from '@approved-premises/ui'
import { bedOccupancyEntryUiFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import { addOverbookingsToSchedule } from './addOverbookingsToSchedule'

const createOccupancyEntry = (startDate: string, endDate: string, type: BedOccupancyEntryUiType) => {
  return bedOccupancyEntryUiFactory.build({
    type,
    startDate: DateFormats.isoToDateObj(startDate),
    endDate: DateFormats.isoToDateObj(endDate),
    length: differenceInDays(DateFormats.isoToDateObj(endDate), DateFormats.isoToDateObj(startDate)) + 1,
  })
}

describe('addOverbookingsToSchedule', () => {
  it('should add overbookings and change the booking dates', () => {
    const entry1 = createOccupancyEntry('2023-04-01', '2023-06-01', 'booking')
    const entry2 = createOccupancyEntry('2023-04-21', '2023-07-01', 'booking')
    const entry3 = createOccupancyEntry('2023-08-01', '2023-08-12', 'open')
    const entry4 = createOccupancyEntry('2023-08-13', '2023-09-23', 'lost_bed')
    const entry5 = createOccupancyEntry('2023-09-10', '2023-09-25', 'booking')

    const result = addOverbookingsToSchedule([entry1, entry2, entry3, entry4, entry5])

    expect(result[0]).toEqual(createOccupancyEntry('2023-04-01', '2023-04-20', 'booking'))
    expect(result[1]).toEqual({
      ...createOccupancyEntry('2023-04-21', '2023-06-01', 'overbooking'),
      items: [
        createOccupancyEntry('2023-04-01', '2023-06-01', 'booking'),
        createOccupancyEntry('2023-04-21', '2023-07-01', 'booking'),
      ],
    })
    expect(result[2]).toEqual(createOccupancyEntry('2023-06-02', '2023-07-01', 'booking'))
    expect(result[3]).toEqual(createOccupancyEntry('2023-08-01', '2023-08-12', 'open'))
    expect(result[4]).toEqual(createOccupancyEntry('2023-08-13', '2023-09-09', 'lost_bed'))
    expect(result[5]).toEqual({
      ...createOccupancyEntry('2023-09-10', '2023-09-23', 'overbooking'),
      items: [
        createOccupancyEntry('2023-08-13', '2023-09-23', 'lost_bed'),
        createOccupancyEntry('2023-09-10', '2023-09-25', 'booking'),
      ],
    })
    expect(result[6]).toEqual(createOccupancyEntry('2023-09-24', '2023-09-25', 'booking'))
  })
})
