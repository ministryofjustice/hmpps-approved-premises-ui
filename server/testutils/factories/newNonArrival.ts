import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewNonarrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewNonarrival>(() => ({
  notes: faker.lorem.sentence(),
  reason: faker.datatype.uuid(),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
}))
