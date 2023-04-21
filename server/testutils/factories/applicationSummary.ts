import { ApprovedPremisesApplicationSummary as ApplicationSummary } from '@approved-premises/api'

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import { DateFormats } from '../../utils/dateUtils'
import risksFactory from './risks'
import personFactory from './person'

export default Factory.define<ApplicationSummary>(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  submittedAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  isWomensApplication: false,
  isPipeApplication: false,
  arrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  risks: risksFactory.build(),
  createdByUserId: faker.datatype.uuid(),
  status: 'inProgress',
}))
