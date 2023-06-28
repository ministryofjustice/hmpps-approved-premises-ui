import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LostBedCancellation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<LostBedCancellation>(() => {
  return {
    createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
    id: faker.string.uuid(),
    notes: faker.lorem.sentence(),
  }
})
