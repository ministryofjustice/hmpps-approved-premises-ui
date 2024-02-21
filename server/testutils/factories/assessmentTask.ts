import { Factory } from 'fishery'

import type { AssessmentTask } from '@approved-premises/api'

import taskFactory from './task'

export default Factory.define<AssessmentTask>(() => ({
  ...taskFactory.build(),
  taskType: 'Assessment',
  createdFromAppeal: false,
}))
