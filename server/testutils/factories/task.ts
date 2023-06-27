import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Task } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

import UserFactory from './user'

export default Factory.define<Task>(() => ({
  allocatedToStaffMember: UserFactory.build(),
  applicationId: faker.string.uuid(),
  dueDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  status: faker.helpers.arrayElement(['not_started', 'in_progress', 'complete']),
  taskType: faker.helpers.arrayElement(['Assessment', 'PlacementRequest', 'BookingAppeal']),
  personName: faker.person.fullName(),
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
}))
