import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { ClarificationNote } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ClarificationNote>(() => ({
  id: faker.datatype.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  createdByStaffMemberId: faker.datatype.uuid(),
  text: faker.lorem.paragraph(),
  query: faker.lorem.sentence(),
}))
