import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type {
  Cas1PremiseCapacity,
  Cas1PremiseCapacityForDay,
  Cas1PremiseCharacteristicAvailability,
} from '@approved-premises/api'
import { addDays, differenceInDays } from 'date-fns'
import cas1PremisesSummaryFactory from './cas1PremisesSummary'
import { DateFormats } from '../../utils/dateUtils'
import { offenceAndRiskCriteria } from '../../utils/placementCriteriaUtils'

export default Factory.define<Cas1PremiseCapacity>(() => {
  const startDate = faker.date.anytime()
  const endDate = faker.date.soon({ days: 365, refDate: startDate })
  const days = differenceInDays(endDate, startDate)

  const capacity = Array.from(Array(days).keys()).map(index =>
    cas1PremiseCapacityForDayFactory.build({
      date: DateFormats.dateObjToIsoDate(addDays(startDate, index)),
    }),
  )

  return {
    premise: cas1PremisesSummaryFactory.build(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    capacity,
  }
})

class CapacityForDayFactory extends Factory<Cas1PremiseCapacityForDay> {
  available() {
    const totalBedCount = faker.number.int({ min: 1, max: 40 })
    const availableBedCount = faker.number.int({ min: 1, max: totalBedCount })
    const bookingCount = totalBedCount - availableBedCount

    return this.params({
      totalBedCount,
      availableBedCount,
      bookingCount,
    })
  }

  overbooked() {
    const totalBedCount = faker.number.int({ min: 1, max: 40 })
    const availableBedCount = 0
    return this.params({
      totalBedCount,
      availableBedCount,
      bookingCount: faker.number.int({ min: totalBedCount, max: totalBedCount + 10 }),
    })
  }
}

export const cas1PremiseCapacityForDayFactory = CapacityForDayFactory.define(() => {
  const totalBedCount = faker.number.int({ min: 0, max: 40 })

  return {
    date: DateFormats.dateObjToIsoDate(faker.date.future()),
    totalBedCount,
    availableBedCount: faker.number.int({ min: 0, max: totalBedCount }),
    bookingCount: faker.number.int({ min: 0, max: totalBedCount + 10 }),
    characteristicAvailability: premiseCharacteristicAvailability.buildList(2),
  }
})

const premiseCharacteristicAvailability = Factory.define<Cas1PremiseCharacteristicAvailability>(() => ({
  characteristic: faker.helpers.arrayElement(offenceAndRiskCriteria),
  availableBedsCount: faker.number.int({ min: 0, max: 40 }),
  bookingsCount: faker.number.int({ min: 0, max: 45 }),
}))
