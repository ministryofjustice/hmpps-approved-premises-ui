import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Arrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Arrival>(() => {
  const arrivalDate = faker.date.soon()
  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    arrivalTime: DateFormats.timeFromDate(arrivalDate),
    bookingId: faker.string.uuid(),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
    notes: faker.lorem.sentence(),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  }
})
