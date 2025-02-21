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
export default Factory.define<Cas1SpaceBookingSummary>(() => {
  const canonicalArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 90 }))
  const canonicalDepartureDate = DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 365, refDate: canonicalArrivalDate }),
  )
  const status = faker.helpers.arrayElement(statuses)
  return {
    id: faker.string.uuid(),
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
