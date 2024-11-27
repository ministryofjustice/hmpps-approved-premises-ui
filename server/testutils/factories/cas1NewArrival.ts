import { Factory } from 'fishery'
import { Cas1NewArrival } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1NewArrival>(() => {
  const arrivalDateTime = faker.date.recent({ days: 1 })
  return {
    expectedDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 365, refDate: arrivalDateTime })),
    arrivalDateTime: arrivalDateTime.toISOString(),
  }
})
