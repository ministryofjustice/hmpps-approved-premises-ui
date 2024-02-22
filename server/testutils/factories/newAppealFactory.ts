import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { NewAppeal } from '../../@types/shared'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewAppeal>(() => ({
  appealDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  appealDetail: faker.lorem.sentence(),
  decision: 'accepted',
  decisionDetail: faker.lorem.sentence(),
}))
