import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Task } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

import UserFactory from './user'
import { apAreaFactory } from './referenceData'
import { getCrn, personSummaryFactory, restrictedPersonSummaryFactory } from './person'

export default Factory.define<Task>(() => ({
  id: faker.string.uuid(),
  allocatedToStaffMember: UserFactory.build(),
  applicationId: faker.string.uuid(),
  dueDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  dueAt: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  status: faker.helpers.arrayElement(['not_started', 'in_progress', 'complete']),
  taskType: faker.helpers.arrayElement(['Assessment', 'PlacementRequest', 'BookingAppeal']),
  personName: faker.person.fullName(),
  crn: getCrn(),
  apArea: apAreaFactory.build(),
  outcomeRecordedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  personSummary: personSummaryFactory.build(),
}))

export const restrictedPersonSummaryTaskFactory = Factory.define<Task>(() => ({
  id: faker.string.uuid(),
  allocatedToStaffMember: UserFactory.build(),
  applicationId: faker.string.uuid(),
  dueDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  dueAt: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  status: faker.helpers.arrayElement(['not_started', 'in_progress', 'complete']),
  taskType: faker.helpers.arrayElement(['Assessment', 'PlacementRequest', 'BookingAppeal']),
  personName: faker.person.fullName(),
  crn: getCrn(),
  apArea: apAreaFactory.build(),
  outcomeRecordedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  personSummary: restrictedPersonSummaryFactory.build(),
}))
