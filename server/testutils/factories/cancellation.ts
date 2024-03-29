import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cancellation } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cancellation>(() => ({
  id: faker.string.uuid(),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
  bookingId: faker.string.uuid(),
  reason: referenceDataFactory.cancellationReasons().build(),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  premisesName: faker.company.name(),
}))
