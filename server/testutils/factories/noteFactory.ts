import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApplicationTimelineNote } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ApplicationTimelineNote>(() => {
  const date = faker.date.past()
  return {
    id: faker.string.uuid(),
    note: faker.lorem.paragraph(),
    createdByUserId: faker.string.uuid(),
    createdAt: DateFormats.dateObjToIsoDateTime(date),
  }
})
