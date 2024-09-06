import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceBooking } from '@approved-premises/api'
import { fullPersonFactory } from './person'
import spaceBookingRequirementsFactory from './spaceBookingRequirements'
import namedIdFactory from './namedId'
import userFactory from './user'
import { DateFormats } from '../../utils/dateUtils'
import staffMemberFactory from './staffMember'

export default Factory.define<Cas1SpaceBooking>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    id: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    person: fullPersonFactory.build(),
    tier: faker.string.alpha(),
    requirements: spaceBookingRequirementsFactory.build(),
    premises: namedIdFactory.build(),
    apArea: namedIdFactory.build(),
    bookedBy: userFactory.build(),
    expectedArrivalDate: DateFormats.dateObjToIsoDate(startDate),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(endDate),
    actualArrivalDate: DateFormats.dateObjToIsoDateTime(startDate),
    actualDepartureDate: DateFormats.dateObjToIsoDateTime(endDate),
    canonicalArrivalDate: DateFormats.dateObjToIsoDate(startDate),
    canonicalDepartureDate: DateFormats.dateObjToIsoDate(endDate),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    keyWorkerAllocation: {
      keyWorker: staffMemberFactory.build(),
      allocatedAt: DateFormats.dateObjToIsoDate(faker.date.recent()),
    },
    otherBookingsInPremisesForCrn: [],
  }
})
