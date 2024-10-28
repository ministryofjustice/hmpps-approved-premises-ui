import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1KeyWorkerAllocation, Cas1SpaceBookingSummary, PersonSummary } from '@approved-premises/api'
import { fullPersonSummaryFactory } from './person'
import staffMemberFactory from './staffMember'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas1SpaceBookingSummary>(() => {
  const canonicalArrivalDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 90 }))
  const canonicalDepartureDate = DateFormats.dateObjToIsoDate(
    faker.date.soon({ days: 365, refDate: canonicalArrivalDate }),
  )
  return {
    id: faker.string.uuid(),
    person: fullPersonSummaryFactory.build() as PersonSummary,
    canonicalArrivalDate,
    canonicalDepartureDate,
    tier: faker.helpers.arrayElement(['A', 'B', 'C']),
    keyWorkerAllocation: { keyWorker: staffMemberFactory.build() } as Cas1KeyWorkerAllocation,
  }
})

