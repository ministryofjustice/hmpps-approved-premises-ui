import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Adjudication } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Adjudication>(() => ({
  id: faker.number.int(),
  reportedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  establishment: faker.location.city(),
  offenceDescription: faker.lorem.sentence(),
  hearingHeld: faker.datatype.boolean(),
  finding: faker.helpers.arrayElement(['PROVED', 'NOT_PROVED']),
}))
