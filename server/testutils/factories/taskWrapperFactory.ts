import { Factory } from 'fishery'
import { TaskWrapper } from '@approved-premises/api'

import taskFactory from './task'
import userFactory from './user'

export default Factory.define<TaskWrapper>(() => ({
  users: userFactory.buildList(5),
  task: taskFactory.build(),
}))
