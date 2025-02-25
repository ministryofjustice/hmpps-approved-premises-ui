import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  Cas1SpaceBookingSummary,
  Cas1SpaceBookingSummaryStatus,
  Cas1SpaceCharacteristic,
  PersonSummary,
} from '@approved-premises/api'
import { fullPersonSummaryFactory } from './person'
import { DateFormats } from '../../utils/dateUtils'
import cas1KeyworkerAllocationFactory from './cas1KeyworkerAllocation'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import cas1PremisesFactory from './cas1Premises'

const statuses: Array<Cas1SpaceBookingSummaryStatus> = [
  'arrived',
  'notArrived',
  'arrivingWithin2Weeks',
  'arrivingWithin6Weeks',
  'departingWithin2Weeks',
  'departed',
  'arrivingToday',
  'departingToday',
  'overdueArrival',
  'overdueDeparture',
]
const arrivedStatusses = ['arrived', 'departingWithin2Weeks', 'departed', 'departingToday', 'overdueDeparture']

class Cas1SpaceBookingSummaryFactory extends Factory<Cas1SpaceBookingSummary> {
  upcoming() {
    return this.params({
      actualArrivalDate: undefined,
      actualDepartureDate: undefined,
      isNonArrival: false,
    })
  }

  current() {
    const arrivalDate = faker.date.recent()
    const departureDate = faker.date.soon()

    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      expectedDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      actualDepartureDate: undefined,
      isNonArrival: false,
    })
  }

  departed() {
    const departureDate = faker.date.recent()
    const arrivalDate = faker.date.recent({ refDate: departureDate })

    return this.params({
      expectedArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      expectedDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      actualArrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
      actualDepartureDate: DateFormats.dateObjToIsoDate(departureDate),
      isNonArrival: false,
    })
  }

  nonArrival() {
    return this.upcoming().params({
      isNonArrival: true,
    })
  }
}

export default Cas1SpaceBookingSummaryFactory.define(() => {
  const canonicalArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 90 }))
  const canonicalDepartureDate = DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 365, refDate: canonicalArrivalDate }),
  )
  const status = faker.helpers.arrayElement(statuses)
  const { id, name } = cas1PremisesFactory.build()

  return {
    id: faker.string.uuid(),
    premises: { id, name },
    person: fullPersonSummaryFactory.build() as PersonSummary,
    canonicalArrivalDate,
    canonicalDepartureDate,
    expectedArrivalDate: canonicalArrivalDate,
    expectedDepartureDate: canonicalDepartureDate,
    actualArrivalDate: arrivedStatusses.includes(status) ? canonicalArrivalDate : undefined,
    actualDepartureDate: status === 'departed' ? canonicalDepartureDate : undefined,
    isNonArrival: status === 'notArrived',
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    keyWorkerAllocation: cas1KeyworkerAllocationFactory.build(),
    status,
    characteristics: faker.helpers.arrayElements(Object.keys(roomCharacteristicMap)) as Array<Cas1SpaceCharacteristic>,
  }
})
