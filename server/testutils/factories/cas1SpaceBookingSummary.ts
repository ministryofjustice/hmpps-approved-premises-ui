import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  Cas1ChangeRequestType,
  type Cas1SpaceBookingStatus,
  Cas1SpaceBookingSummary,
  Cas1SpaceCharacteristic,
  PersonSummary,
  TransferReason,
} from '@approved-premises/api'
import { fullPersonSummaryFactory } from './person'
import { DateFormats } from '../../utils/dateUtils'
import cas1KeyworkerAllocationFactory from './cas1KeyworkerAllocation'
import { allSpaceBookingCharacteristicMap } from '../../utils/characteristicsUtils'
import cas1PremisesFactory from './cas1Premises'
import { overallStatusTextMap, statusTextMap } from '../../utils/placements/status'
import { newPlacementReasons } from '../../utils/match'

const arrivedStatuses = ['arrived', 'departingWithin2Weeks', 'departed', 'departingToday', 'overdueDeparture']

class Cas1SpaceBookingSummaryFactory extends Factory<Cas1SpaceBookingSummary> {
  upcoming() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      isNonArrival: false,
      status: 'upcoming',
    })
  }

  current() {
    const arrivalDate = faker.date.recent({ days: 42 })
    const departureDate = faker.date.soon({ days: 42 })

    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      expectedDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      actualDepartureDate: undefined,
      isNonArrival: false,
      status: 'arrived',
    })
  }

  departed() {
    const departureDate = faker.date.recent({ days: 10 })
    const arrivalDate = faker.date.recent({ days: 84, refDate: departureDate })

    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      expectedDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      actualDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      isNonArrival: false,
      status: 'departed',
    })
  }

  nonArrival() {
    return this.upcoming().params({
      isNonArrival: true,
      status: 'notArrived',
    })
  }

  cancelled() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      isNonArrival: false,
      isCancelled: true,
      status: 'cancelled',
    })
  }
}

export default Cas1SpaceBookingSummaryFactory.define(() => {
  const canonicalArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 90 }))
  const canonicalDepartureDate = DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 365, refDate: canonicalArrivalDate }),
  )
  const status = faker.helpers.arrayElement(Object.keys(statusTextMap))
  const { id, name } = cas1PremisesFactory.build()

  return {
    id: faker.string.uuid(),
    premises: { id, name },
    person: fullPersonSummaryFactory.build() as PersonSummary,
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
    canonicalArrivalDate,
    canonicalDepartureDate,
    expectedArrivalDate: canonicalArrivalDate,
    expectedDepartureDate: canonicalDepartureDate,
    actualArrivalDate: arrivedStatuses.includes(status) ? canonicalArrivalDate : undefined,
    actualDepartureDate: status === 'departed' ? canonicalDepartureDate : undefined,
    isNonArrival: status === 'notArrived',
    isCancelled: false,
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    keyWorkerAllocation: cas1KeyworkerAllocationFactory.build(),
    characteristics: faker.helpers.arrayElements(Object.keys(allSpaceBookingCharacteristicMap), {
      min: 0,
      max: 3,
    }) as Array<Cas1SpaceCharacteristic>,
    deliusEventNumber: faker.string.numeric({ length: 6 }),
    plannedTransferRequested: false,
    appealRequested: false,
    openChangeRequestTypes: [] as Array<Cas1ChangeRequestType>,
    transferReason: faker.helpers.arrayElement(Object.keys(newPlacementReasons)) as TransferReason,
    additionalInformation: faker.lorem.words(50),
    status: faker.helpers.arrayElement(Object.keys(overallStatusTextMap)) as Cas1SpaceBookingStatus,
  }
})
