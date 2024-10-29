import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1KeyWorkerAllocation, Cas1SpaceBookingSummary, PersonSummary } from '@approved-premises/api'
import { fullPersonSummaryFactory } from './person'
import staffMemberFactory from './staffMember'

export default Factory.define<Cas1SpaceBookingSummary>(() => ({
  id: faker.string.uuid(),
  person: fullPersonSummaryFactory.build() as PersonSummary,
  canonicalArrivalDate: faker.date.soon({ days: 90 }).toISOString().split('T')[0],
  canonicalDepartureDate: faker.date.soon({ days: 365 }).toISOString().split('T')[0],
  tier: faker.helpers.arrayElement(['A', 'B', 'C']),
  keyWorkerAllocation: { keyWorker: staffMemberFactory.build() } as Cas1KeyWorkerAllocation,
}))
