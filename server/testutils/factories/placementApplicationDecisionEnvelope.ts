import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { PlacementApplicationDecisionEnvelope } from '../../@types/shared'

export default Factory.define<PlacementApplicationDecisionEnvelope>(() => ({
  decision: faker.helpers.arrayElement(['accepted', 'rejected', 'withdraw', 'withdrawn_by_pp'] as const),
  summaryOfChanges: faker.lorem.sentence(),
  decisionSummary: faker.lorem.sentence(),
}))
