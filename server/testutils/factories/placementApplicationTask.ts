import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PlacementApplicationTask } from '@approved-premises/api'

import taskFactory from './task'
import { tierEnvelopeFactory } from './risks'
import placementDatesFactory from './placementDates'

export default Factory.define<PlacementApplicationTask>(() => ({
  ...taskFactory.build(),
  taskType: 'PlacementApplication',
  id: faker.string.uuid(),
  tier: tierEnvelopeFactory.build(),
  releaseType: 'rotl',
  placementType: 'rotl',
  placementDates: placementDatesFactory.buildList(1),
  outcome: faker.helpers.arrayElement(['accepted', 'rejected', 'withdraw', 'withdrawn_by_pp']),
}))
