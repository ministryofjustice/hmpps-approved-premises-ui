import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import {
  Cas1PremiseCapacity,
  type Cas1PremiseCapacityForDay,
  Cas1PremiseCharacteristicAvailability,
} from '@approved-premises/api'
import cas1PremisesSummaryFactory from './cas1PremisesSummary'
import { DateFormats } from '../../utils/dateUtils'
import { offenceAndRiskCriteria } from '../../utils/placementCriteriaUtils'

export default Factory.define<Cas1PremiseCapacity>(() => {
  const startDate = faker.date.anytime()
  return {
    premise: cas1PremisesSummaryFactory.build(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 365, refDate: startDate })),
    capacity: premiseCapacityForDayFactory.buildList(2),
  }
})

const premiseCapacityForDayFactory = Factory.define<Cas1PremiseCapacityForDay>(() => ({
  date: DateFormats.dateObjToIsoDate(faker.date.anytime()),
  totalBedCount: faker.number.int(),
  availableBedCount: faker.number.int(),
  bookingCount: faker.number.int(),
  characteristicAvailability: premiseCharacteristicAvailability.buildList(2),
}))

const premiseCharacteristicAvailability = Factory.define<Cas1PremiseCharacteristicAvailability>(() => ({
  characteristic: faker.helpers.arrayElement(offenceAndRiskCriteria),
  availableBedsCount: faker.number.int(),
  bookingsCount: faker.number.int(),
}))
