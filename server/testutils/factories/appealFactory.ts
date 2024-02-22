import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Appeal } from '../../@types/shared'
import { DateFormats } from '../../utils/dateUtils'
import userFactory from './user'

export default Factory.define<Appeal>(() => ({
  id: faker.string.uuid(),
  appealDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  appealDetail: faker.lorem.sentence(),
  decision: 'accepted',
  decisionDetail: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  applicationId: faker.string.uuid(),
  assessmentId: faker.string.uuid(),
  createdByUser: userFactory.build(),
}))
