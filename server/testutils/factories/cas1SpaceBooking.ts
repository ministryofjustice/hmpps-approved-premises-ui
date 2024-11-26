import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1KeyWorkerAllocation, Cas1SpaceBooking, Person } from '@approved-premises/api'
import { fullPersonFactory } from './person'
import cas1SpaceBookingDatesFactory from './cas1SpaceBookingDates'
import cas1SpaceBookingRequirementsFactory from './spaceBookingRequirements'
import userFactory from './user'

import staffMemberFactory from './staffMember'
import { DateFormats } from '../../utils/dateUtils'
import cas1SpaceBookingNonArrivalFactory from './cas1SpaceBookingNonArrival'
import referenceDataFactory from './referenceData'

class Cas1SpaceBookingFactory extends Factory<Cas1SpaceBooking> {
  upcoming() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      departure: undefined,
    })
  }

  current() {
    return this.params({
      actualDepartureDate: undefined,
      departure: undefined,
    })
  }

  nonArrival() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      departure: undefined,
      nonArrival: cas1SpaceBookingNonArrivalFactory.build(),
    })
  }
}

export default Cas1SpaceBookingFactory.define(() => {
  const startDateTime = faker.date.soon({ days: 90 })
  const endDateTime = faker.date.soon({ days: 365, refDate: startDateTime })
  const [actualArrivalDate, actualDepartureDate] = [startDateTime, endDateTime].map(DateFormats.dateObjToIsoDateTime)
  const [canonicalArrivalDate, canonicalDepartureDate] = [startDateTime, endDateTime].map(DateFormats.dateObjToIsoDate)
  const [expectedArrivalDate, expectedDepartureDate] = faker.date
    .betweens({ from: startDateTime, to: endDateTime, count: 2 })
    .map(DateFormats.dateObjToIsoDate)
  return {
    id: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    person: fullPersonFactory.build() as Person,
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    requirements: cas1SpaceBookingRequirementsFactory.build(),
    premises: {
      id: faker.string.uuid(),
      name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    },
    apArea: { id: faker.string.uuid(), name: `${faker.location.cardinalDirection()} ${faker.location.county()}` },
    bookedBy: userFactory.build(),
    expectedArrivalDate,
    actualArrivalDate,
    expectedDepartureDate,
    actualDepartureDate,
    canonicalArrivalDate,
    canonicalDepartureDate,
    departure: {
      reason: referenceDataFactory.departureReasons().build(),
      moveOnCategory: referenceDataFactory.moveOnCategories().build(),
      notes: faker.word.words(20),
    },
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    keyWorkerAllocation: { keyWorker: staffMemberFactory.build() } as Cas1KeyWorkerAllocation,
    otherBookingsInPremisesForCrn: cas1SpaceBookingDatesFactory.buildList(4),
    deliusEventNumber: String(faker.number.int()),
  }
})
