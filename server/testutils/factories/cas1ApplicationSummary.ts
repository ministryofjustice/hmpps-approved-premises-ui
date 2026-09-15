import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { Cas1ApplicationSummary } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import risksFactory from './risks'
import { fullPersonSummaryFactory } from './person'

export default Factory.define<Cas1ApplicationSummary>(() => ({
  id: faker.string.uuid(),
  type: 'CAS1',
  person: fullPersonSummaryFactory.build(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  isWomensApplication: false,
  isPipeApplication: false,
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  risks: risksFactory.build(),
  createdByUserId: faker.string.uuid(),
  createdByUserName: faker.person.fullName(),
  status: 'started',
  isWithdrawn: faker.datatype.boolean(),
  releaseType: 'in_community',
  hasRequestsForPlacement: faker.datatype.boolean(),
}))
