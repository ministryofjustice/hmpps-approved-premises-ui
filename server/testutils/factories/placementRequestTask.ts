import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PlacementRequestTask } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import taskFactory from './task'
import risksFactory from './risks'

export default Factory.define<PlacementRequestTask>(() => ({
  ...taskFactory.build(),
  taskType: 'PlacementRequest',
  id: faker.string.uuid(),
  risks: risksFactory.build(),
  releaseType: 'rotl',
  expectedArrival: DateFormats.dateObjToIsoDate(faker.date.soon()),
  duration: faker.number.int({ min: 1, max: 12 }),
  placementRequestStatus: faker.helpers.arrayElement(['notMatched', 'unableToMatch', 'matched']),
}))
