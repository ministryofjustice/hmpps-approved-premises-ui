import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1KeyWorkerAllocation, Cas1SpaceBooking, PersonSummary } from '@approved-premises/api'
import { fullPersonFactory } from './person'
import cas1SpaceBookingDatesFactory from './cas1SpaceBookingDates'
import cas1SpaceBookingRequirementsFactory from './spaceBookingRequirements'
import staffMemberFactory from './staffMember'
import { DateFormats } from '../../utils/dateUtils'

const fakeTime = () => faker.number.int({ max: 60 * 60 * 24 * 1000 })

export default Factory.define<Cas1SpaceBooking>(() => {
  const startDateTime = faker.date.soon({ days: 90 }) + fakeTime()
  const endDateTime = faker.date.soon({ days: 365, refDate: startDateTime }) + fakeTime()
  const [actualArrivalDate, actualDepartureDate] = [startDateTime, endDateTime].map(DateFormats.dateObjToIsoDateTime)
  const [canonicalArrivalDate, canonicalDepartureDate] = [startDateTime, endDateTime].map(DateFormats.dateObjToIsoDate)
  const [expectedArrivalDate, expectedDepartureDate] = faker.date
    .betweens({ from: startDateTime, to: endDateTime, count: 2 })
    .map(DateFormats.dateObjToIsoDate)
  return {
    id: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    person: fullPersonFactory.build() as PersonSummary,
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    requirements: cas1SpaceBookingRequirementsFactory.build(),
    premises: {
      id: faker.string.uuid(),
      name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    },
    apArea: { id: faker.string.uuid(), name: `${faker.location.cardinalDirection()} ${faker.location.county()}` },
    expectedArrivalDate,
    actualArrivalDate,
    actualDepartureDate,
    expectedDepartureDate,
    canonicalArrivalDate,
    canonicalDepartureDate,
    departureReason: { id: faker.string.uuid(), name: faker.word.noun() },
    departureMoveOnCategory: { id: faker.string.uuid(), name: faker.word.noun() },
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent() + fakeTime()),
    keyWorkerAllocation: { keyWorker: staffMemberFactory.build() } as Cas1KeyWorkerAllocation,
    otherBookingsInPremisesForCrn: cas1SpaceBookingDatesFactory.buildList(4),
  }
})
