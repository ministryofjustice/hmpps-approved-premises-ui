import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LostBed } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<LostBed>(() => ({
  id: faker.string.uuid(),
  bedId: faker.string.uuid(),
  bedName: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  notes: faker.lorem.sentence(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  referenceNumber: faker.string.uuid(),
  reason: referenceDataFactory.lostBedReasons().build(),
  status: 'active',
  cancellation: { id: faker.string.uuid(), createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()) },
}))
