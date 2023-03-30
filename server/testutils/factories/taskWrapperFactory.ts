import { TaskWrapper } from '@approved-premises/api'
import { Factory } from 'fishery'

import taskFactory from './task'
import userFactory from './user'

export default Factory.define<TaskWrapper>(() => ({
  users: userFactory.buildList(5),
  task: taskFactory.build(),
}))
