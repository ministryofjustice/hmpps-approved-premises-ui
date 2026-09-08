import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Cas1AuthorisedPlacementPeriod } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

class Cas1RequestedPlacementPeriodFactory extends Factory<Cas1AuthorisedPlacementPeriod> {}

export default Cas1RequestedPlacementPeriodFactory.define(() => ({
  arrival: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 100 })),
  arrivalFlexible: faker.datatype.boolean(),
  duration: faker.number.int({ min: 1, max: 365 }),
}))
