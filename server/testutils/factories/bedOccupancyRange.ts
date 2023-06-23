import { addDays, differenceInDays } from 'date-fns'

import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type {
  BedOccupancyBookingEntry,
  BedOccupancyEntry,
  BedOccupancyLostBedEntry,
  BedOccupancyOpenEntry,
  BedOccupancyRange,
} from '@approved-premises/api'
import {
  BedOccupancyBookingEntryUi,
  BedOccupancyEntryCalendar,
  BedOccupancyEntryUi,
  BedOccupancyLostBedEntryUi,
  BedOccupancyOpenEntryUi,
  BedOccupancyOverbookingEntryUi,
  BedOccupancyRangeUi,
} from '../../@types/ui'

import { DateFormats } from '../../utils/dateUtils'

export const bedOccupancyRangeFactory = Factory.define<BedOccupancyRange>(generator => ({
  bedId: faker.string.uuid(),
  bedName: `bed ${generator.sequence}`,
  schedule: faker.helpers.arrayElements(
    [
      bedOccupancyEntryBookingFactory.build(),
      bedOccupancyEntryLostBedFactory.build(),
      bedOccupancyEntryOpenFactory.build(),
    ],
    10,
  ),
}))

const generateStay = () => {
  const startDate = addDays(new Date(), Math.floor(Math.random() * 10))
  const endDate = addDays(startDate, Math.floor(Math.random() * 20))
  const length = differenceInDays(endDate, startDate)

  return { startDate, endDate, length }
}

export const bedOccupancyEntryFactory = Factory.define<BedOccupancyEntry>(() => {
  const { startDate, endDate, length } = generateStay()

  return {
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    length,
    type: 'booking',
  }
})

const bedOccupancyEntryBookingFactory = Factory.define<BedOccupancyBookingEntry>(() => ({
  ...bedOccupancyEntryFactory.build(),
  type: 'booking',
  personName: faker.person.firstName(),
  bookingId: faker.string.uuid(),
}))

const bedOccupancyEntryLostBedFactory = Factory.define<BedOccupancyLostBedEntry>(() => ({
  ...bedOccupancyEntryFactory.build(),
  type: 'lost_bed',
  lostBedId: faker.string.uuid(),
}))

const bedOccupancyEntryOpenFactory = Factory.define<BedOccupancyOpenEntry>(() => ({
  ...bedOccupancyEntryFactory.build(),
  type: 'open',
}))

export const bedOccupancyRangeFactoryUi = Factory.define<BedOccupancyRangeUi>(generator => ({
  bedId: faker.string.uuid(),
  bedName: `bed ${generator.sequence}`,
  schedule: faker.helpers.arrayElements(
    [
      bedOccupancyEntryBookingUiFactory.build(),
      bedOccupancyEntryLostBedUiFactory.build(),
      bedOccupancyEntryOpenUiFactory.build(),
    ],
    10,
  ),
}))

export const bedOccupancyEntryUiFactory = Factory.define<BedOccupancyEntryUi>(() => {
  const { startDate, endDate, length } = generateStay()
  return {
    startDate,
    endDate,
    length,
    type: 'booking',
  } as BedOccupancyEntryUi
})

export const bedOccupancyEntryCalendarFactory = Factory.define<BedOccupancyEntryCalendar>(() => {
  const { startDate, endDate, length } = generateStay()
  return {
    startDate,
    endDate,
    length,
    type: 'booking',
    label: 'Some text goes here',
  } as BedOccupancyEntryCalendar
})

export const bedOccupancyEntryBookingUiFactory = Factory.define<BedOccupancyBookingEntryUi>(
  () =>
    ({
      ...bedOccupancyEntryUiFactory.build(),
      type: 'booking',
      personName: faker.person.firstName(),
      bookingId: faker.string.uuid(),
    } as BedOccupancyBookingEntryUi),
)

export const bedOccupancyEntryOverbookingUiFactory = Factory.define<BedOccupancyOverbookingEntryUi>(
  () =>
    ({
      ...bedOccupancyEntryUiFactory.build(),
      type: 'overbooking',
    } as BedOccupancyOverbookingEntryUi),
)

export const bedOccupancyEntryLostBedUiFactory = Factory.define<BedOccupancyLostBedEntryUi>(
  () =>
    ({
      ...bedOccupancyEntryUiFactory.build(),
      type: 'lost_bed',
      lostBedId: faker.string.uuid(),
    } as BedOccupancyLostBedEntryUi),
)

export const bedOccupancyEntryOpenUiFactory = Factory.define<BedOccupancyOpenEntryUi>(
  () =>
    ({
      ...bedOccupancyEntryUiFactory.build(),
      type: 'open',
    } as BedOccupancyOpenEntryUi),
)
