import { Factory } from 'fishery'

import type { BookingAppealTask } from '@approved-premises/api'

import taskFactory from './task'

export default Factory.define<BookingAppealTask>(() => ({
  ...taskFactory.build(),
  taskType: 'BookingAppeal',
}))
