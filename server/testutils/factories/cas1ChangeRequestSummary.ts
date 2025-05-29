import { Cas1ChangeRequestSummary, Cas1ChangeRequestType } from '@approved-premises/api'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { personSummaryFactory } from './person'
import { DateFormats } from '../../utils/dateUtils'
import { riskTierLevel } from './risks'

const changeRequestTypes: ReadonlyArray<Cas1ChangeRequestType> = [
  'placementAppeal',
  'placementExtension',
  'plannedTransfer',
]

export default Factory.define<Cas1ChangeRequestSummary>(() => ({
  id: faker.string.uuid(),
  person: personSummaryFactory.build(),
  tier: riskTierLevel,
  type: faker.helpers.arrayElement(changeRequestTypes),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  expectedArrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 60 })),
  actualArrivalDate: DateFormats.dateObjToIsoDate(faker.date.soon({ days: 60 })),
  placementRequestId: faker.string.uuid(),
}))
