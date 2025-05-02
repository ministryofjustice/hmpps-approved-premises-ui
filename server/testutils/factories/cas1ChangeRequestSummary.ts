import { Cas1ChangeRequestSummary, Cas1ChangeRequestType } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { DateFormats } from '../../utils/dateUtils'
import { personSummaryFactory } from './person'

export default Factory.define<Cas1ChangeRequestSummary>(() => ({
  id: faker.string.uuid(),
  person: personSummaryFactory.build(),
  type: faker.helpers.arrayElement([
    'placementAppeal',
    'placementExtension',
    'plannedTransfer',
  ]) as Cas1ChangeRequestType,
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  tier: faker.helpers.arrayElement(['A', 'B', 'C']),
  expectedArrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 60 })),
  actualArrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 60 })),
  placementRequestId: faker.string.uuid(),
}))
