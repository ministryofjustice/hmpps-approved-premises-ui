import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { PersonAcctAlert } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<PersonAcctAlert>(() => ({
  alertId: faker.number.int({ min: 1, max: 10 }),
  comment: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  dateCreated: DateFormats.dateObjToIsoDate(faker.date.past()),
  dateExpires: DateFormats.dateObjToIsoDate(faker.date.future()),
  alertTypeDescription: faker.word.words(),
}))
