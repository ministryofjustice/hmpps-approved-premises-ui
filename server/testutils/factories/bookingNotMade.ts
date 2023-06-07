import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { BookingNotMade } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<BookingNotMade>(() => ({
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  id: faker.string.uuid(),
  placementRequestId: faker.string.uuid(),
  notes: faker.lorem.paragraph(),
}))
