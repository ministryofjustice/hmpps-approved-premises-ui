import { addDays, differenceInDays } from 'date-fns'
import type { BedOccupancyEntry, BedOccupancyRange } from '@approved-premises/api'

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<BedOccupancyRange>(generator => ({
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

const bedOccupancyEntryBookingFactory = Factory.define<BedOccupancyBookingEntryUi>(() => ({
  ...bedOccupancyEntryFactory.build(),
  type: 'booking',
  personName: faker.person.firstName(),
  bookingId: faker.string.uuid(),
}))

const bedOccupancyEntryLostBedFactory = Factory.define<BedOccupancyLostBedEntryUi>(() => ({
  ...bedOccupancyEntryFactory.build(),
  type: 'lost_bed',
  lostBedId: faker.string.uuid(),
}))

const bedOccupancyEntryOpenFactory = Factory.define<BedOccupancyOpenEntryUi>(() => ({
  ...bedOccupancyEntryFactory.build(),
  type: 'open',
}))
