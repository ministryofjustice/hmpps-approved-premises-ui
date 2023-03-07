import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApprovedPremisesLostBed as LostBed } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<LostBed>(() => ({
  id: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  numberOfBeds: faker.datatype.number({ min: 1, max: 10 }),
  referenceNumber: faker.datatype.uuid(),
  reason: referenceDataFactory.lostBedReasons().build(),
  status: 'active',
  cancellation: null,
}))
