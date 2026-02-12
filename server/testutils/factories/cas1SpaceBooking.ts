import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import type {
  Cas1SpaceBooking,
  Cas1SpaceBookingAction,
  Cas1SpaceBookingCancellation,
  Cas1SpaceBookingNonArrival,
  Cas1SpaceBookingStatus,
  Person,
  UserSummary,
} from '@approved-premises/api'
import { addDays } from 'date-fns'
import { fullPersonFactory } from './person'
import cas1SpaceBookingDatesFactory from './cas1SpaceBookingDates'
import userFactory from './user'

import { DateFormats } from '../../utils/dateUtils'
import cas1SpaceBookingNonArrivalFactory from './cas1SpaceBookingNonArrival'
import cas1SpaceBookingDepartureFactory from './cas1SpaceBookingDeparture'
import cas1NewSpaceBookingCancellationFactory from './cas1NewSpaceBookingCancellation'
import { departureReasonFactory } from './referenceData'
import { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from '../../utils/placements'
import { filterOutAPTypes } from '../../utils/match'
import cas1ChangeRequestSummary from './cas1ChangeRequestSummary'
import { placementCriteria } from './cas1PlacementRequestDetail'
import cas1KeyworkerAllocationFactory from './cas1KeyworkerAllocation'
import { overallStatusTextMap } from '../../utils/placements/status'

class Cas1SpaceBookingFactory extends Factory<Cas1SpaceBooking> {
  upcoming() {
    return this.params({
      actualArrivalDate: undefined,
      actualArrivalTime: undefined,
      actualDepartureDate: undefined,
      actualDepartureTime: undefined,
      departure: undefined,
      status: 'upcoming',
    })
  }

  current() {
    const arrivalDateTime = faker.date.recent({ days: 50 })
    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDateTime),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDateTime),
      actualArrivalTime: '10:00',
      actualDepartureDate: undefined,
      actualDepartureTime: undefined,
      departure: undefined,
      status: 'arrived',
    })
  }

  nonArrival() {
    return this.params({
      actualArrivalDate: undefined,
      actualArrivalTime: undefined,
      actualDepartureDate: undefined,
      actualDepartureTime: undefined,
      departure: undefined,
      nonArrival: cas1SpaceBookingNonArrivalFactory.build(),
      status: 'notArrived',
    })
  }

  departed() {
    const actualDepartureDate = faker.date.recent({ days: 20 })
    const actualArrivalDate = faker.date.past({ years: 1, refDate: actualDepartureDate })

    return this.params({
      actualArrivalDate: DateFormats.dateObjToIsoDate(actualArrivalDate),
      actualArrivalTime: '12:00',
      actualDepartureDate: DateFormats.dateObjToIsoDate(actualDepartureDate),
      actualDepartureTime: '18:30',
      departure: cas1SpaceBookingDepartureFactory.build(),
      status: 'departed',
    })
  }

  departedBreachOrRecall() {
    return this.departed().params({
      departure: cas1SpaceBookingDepartureFactory.build({
        parentReason: departureReasonFactory.build({
          id: BREACH_OR_RECALL_REASON_ID,
        }),
        moveOnCategory: undefined,
      }),
    })
  }

  departedPlannedMoveOn() {
    return this.departed().params({
      departure: cas1SpaceBookingDepartureFactory.build({
        reason: departureReasonFactory.build({
          id: PLANNED_MOVE_ON_REASON_ID,
        }),
      }),
    })
  }

  cancelled() {
    return this.params({
      cancellation: cas1NewSpaceBookingCancellationFactory.build(),
      status: 'cancelled',
    })
  }

  withAssignedKeyworker(user: UserSummary) {
    return this.params({
      keyWorkerAllocation: cas1KeyworkerAllocationFactory.build(user),
    })
  }
}

export default Cas1SpaceBookingFactory.define(({ params }) => {
  const expectedArrivalDateTime = faker.date.soon({ days: 90 })
  const expectedDepartureDateTime = addDays(params.expectedArrivalDate || expectedArrivalDateTime, 84)
  const [expectedArrivalDate, expectedDepartureDate] = [expectedArrivalDateTime, expectedDepartureDateTime].map(
    DateFormats.dateObjToIsoDate,
  )
  return {
    id: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    placementRequestId: faker.string.uuid(),
    person: fullPersonFactory.build() as Person,
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    characteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
    premises: {
      id: faker.string.uuid(),
      name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    },
    apArea: { id: faker.string.uuid(), name: `${faker.location.cardinalDirection()} ${faker.location.county()}` },
    bookedBy: userFactory.build(),
    expectedArrivalDate,
    expectedDepartureDate,
    canonicalArrivalDate: expectedArrivalDate,
    canonicalDepartureDate: expectedDepartureDate,
    departure: cas1SpaceBookingDepartureFactory.build(),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    keyWorkerAllocation: cas1KeyworkerAllocationFactory.build(),
    otherBookingsInPremisesForCrn: cas1SpaceBookingDatesFactory.buildList(4),
    deliusEventNumber: String(faker.number.int()),
    nonArrival: undefined as Cas1SpaceBookingNonArrival,
    cancellation: undefined as Cas1SpaceBookingCancellation,
    allowedActions: [] as Array<Cas1SpaceBookingAction>,
    openChangeRequests: cas1ChangeRequestSummary.buildList(3),
    status: faker.helpers.arrayElement(Object.keys(overallStatusTextMap)) as Cas1SpaceBookingStatus,
  }
})
