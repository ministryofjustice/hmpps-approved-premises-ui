import { Factory } from 'fishery'

import type { AssessmentTask } from '@approved-premises/api'

import { faker } from '@faker-js/faker/locale/en_GB'
import taskFactory, { restrictedPersonSummaryTaskFactory } from './task'

export default Factory.define<AssessmentTask>(() => ({
  ...taskFactory.build(),
  taskType: 'Assessment',
  createdFromAppeal: false,
  outcome: faker.helpers.arrayElement(['accepted', 'rejected']),
}))

export const restrictedPersonSummaryAssessmentTaskFactory = Factory.define<AssessmentTask>(() => ({
  ...restrictedPersonSummaryTaskFactory.build(),
  taskType: 'Assessment',
  createdFromAppeal: false,
  outcome: faker.helpers.arrayElement(['accepted', 'rejected']),
}))
