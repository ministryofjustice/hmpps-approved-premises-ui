import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Extension } from '@approved-premises-shared'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Extension>(() => ({
  id: faker.datatype.uuid(),
  previousDepartureDate: DateFormats.formatApiDate(faker.date.soon()),
  newDepartureDate: DateFormats.formatApiDate(faker.date.future()),
  bookingId: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
}))
