import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Reallocation } from '@approved-premises/api'

import userFactory from './user'
import { taskTypes } from './task'

export default Factory.define<Reallocation>(() => ({
  taskType: faker.helpers.arrayElement(taskTypes),
  user: userFactory.build(),
}))
