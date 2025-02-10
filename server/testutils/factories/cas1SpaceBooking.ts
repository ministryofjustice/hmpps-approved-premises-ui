import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import type {
  Cas1KeyWorkerAllocation,
  Cas1SpaceBooking,
  Cas1SpaceBookingSummaryStatus,
  Person,
} from '@approved-premises/api'
import { fullPersonFactory } from './person'
import cas1SpaceBookingDatesFactory from './cas1SpaceBookingDates'
import cas1SpaceBookingRequirementsFactory from './spaceBookingRequirements'
import userFactory from './user'

import staffMemberFactory from './staffMember'
import { DateFormats } from '../../utils/dateUtils'
import cas1SpaceBookingNonArrivalFactory from './cas1SpaceBookingNonArrival'
import cas1SpaceBookingDepartureFactory from './cas1SpaceBookingDeparture'
import { departureReasonFactory } from './referenceData'
import { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from '../../utils/placements'
import { filterOutAPTypes } from '../../utils/match'
import { placementCriteria } from './placementRequest'

class Cas1SpaceBookingFactory extends Factory<Cas1SpaceBooking> {
  upcoming() {
    return this.params({
      actualArrivalDateOnly: undefined,
      actualArrivalTime: undefined,
      actualDepartureDateOnly: undefined,
      actualDepartureTime: undefined,
      departure: undefined,
      status: faker.helpers.arrayElement([
        'arrivingToday',
        'arrivingWithin6Weeks',
        'arrivingWithin2Weeks',
      ] as Array<Cas1SpaceBookingSummaryStatus>),
    })
  }

  current() {
    return this.params({
      actualArrivalDateOnly: DateFormats.dateObjToIsoDate(faker.date.recent({ days: 180 })),
      actualDepartureDateOnly: undefined,
      actualDepartureTime: undefined,
      departure: undefined,
      status: 'arrived',
    })
  }

  nonArrival() {
    return this.params({
      actualArrivalDateOnly: undefined,
      actualArrivalTime: undefined,
      actualDepartureDateOnly: undefined,
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
      actualArrivalDateOnly: DateFormats.dateObjToIsoDate(actualArrivalDate),
      actualDepartureDateOnly: DateFormats.dateObjToIsoDate(actualDepartureDate),
      departure: cas1SpaceBookingDepartureFactory.build({
        moveOnCategory: undefined,
      }),
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
}

export default Cas1SpaceBookingFactory.define(() => {
  const startDateTime = faker.date.soon({ days: 90 })
  const endDateTime = faker.date.soon({ days: 365, refDate: startDateTime })
  const [actualArrivalDateOnly, actualDepartureDateOnly] = [startDateTime, endDateTime].map(
    DateFormats.dateObjToIsoDate,
  )
  const [actualArrivalTime, actualDepartureTime] = [startDateTime, endDateTime].map(DateFormats.dateObjTo24hrTime)
  const [canonicalArrivalDate, canonicalDepartureDate] = [startDateTime, endDateTime].map(DateFormats.dateObjToIsoDate)
  const [expectedArrivalDate, expectedDepartureDate] = faker.date
    .betweens({ from: startDateTime, to: endDateTime, count: 2 })
    .map(DateFormats.dateObjToIsoDate)
  return {
    id: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    assessmentId: faker.string.uuid(),
    requestForPlacementId: faker.string.uuid(),
    person: fullPersonFactory.build() as Person,
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    requirements: cas1SpaceBookingRequirementsFactory.build(),
    characteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
    premises: {
      id: faker.string.uuid(),
      name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    },
    apArea: { id: faker.string.uuid(), name: `${faker.location.cardinalDirection()} ${faker.location.county()}` },
    bookedBy: userFactory.build(),
    expectedArrivalDate,
    actualArrivalDateOnly,
    actualArrivalTime,
    expectedDepartureDate,
    actualDepartureDateOnly,
    actualDepartureTime,
    canonicalArrivalDate,
    canonicalDepartureDate,
    departure: cas1SpaceBookingDepartureFactory.build(),
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    keyWorkerAllocation: { keyWorker: staffMemberFactory.build() } as Cas1KeyWorkerAllocation,
    otherBookingsInPremisesForCrn: cas1SpaceBookingDatesFactory.buildList(4),
    deliusEventNumber: String(faker.number.int()),
    nonArrival: undefined,
    status: 'departed' as Cas1SpaceBookingSummaryStatus,
  }
})
