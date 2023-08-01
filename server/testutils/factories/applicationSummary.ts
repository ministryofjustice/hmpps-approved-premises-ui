import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ApprovedPremisesApplicationSummary as ApplicationSummary } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import risksFactory from './risks'
import personFactory from './person'

export default Factory.define<ApplicationSummary>(() => ({
  id: faker.string.uuid(),
  type: 'CAS1',
  person: personFactory.build(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  isWomensApplication: false,
  isPipeApplication: false,
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  risks: risksFactory.build(),
  createdByUserId: faker.string.uuid(),
  status: 'inProgress',
}))
