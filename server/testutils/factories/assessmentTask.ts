import { Factory } from 'fishery'

import type { AssessmentTask } from '@approved-premises/api'

import { faker } from '@faker-js/faker/locale/en_GB'
import taskFactory from './task'

export default Factory.define<AssessmentTask>(() => ({
  ...taskFactory.build(),
  taskType: 'Assessment',
  createdFromAppeal: false,
  outcome: faker.helpers.arrayElement(['accepted', 'rejected']),
}))
