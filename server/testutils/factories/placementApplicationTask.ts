import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PlacementApplicationTask } from '@approved-premises/api'

import taskFactory from './task'
import risksFactory from './risks'
import placementDatesFactory from './placementDates'

export default Factory.define<PlacementApplicationTask>(() => ({
  ...taskFactory.build(),
  taskType: 'PlacementApplication',
  id: faker.string.uuid(),
  risks: risksFactory.build(),
  releaseType: 'rotl',
  placementType: 'rotl',
  placementDates: placementDatesFactory.buildList(1),
}))
