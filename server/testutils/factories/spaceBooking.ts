import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceBooking } from '@approved-premises/api'
import { fullPersonFactory } from './person'
import spaceBookingRequirementsFactory from './spaceBookingRequirements'
import namedIdFactory from './namedId'
import userFactory from './user'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1SpaceBooking>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    id: faker.string.uuid(),
    person: fullPersonFactory.build(),
    requirements: spaceBookingRequirementsFactory.build(),
    premises: namedIdFactory.build(),
    apArea: namedIdFactory.build(),
    bookedBy: userFactory.build(),
    arrivalDate: DateFormats.dateObjToIsoDate(startDate),
    departureDate: DateFormats.dateObjToIsoDate(endDate),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  }
})
