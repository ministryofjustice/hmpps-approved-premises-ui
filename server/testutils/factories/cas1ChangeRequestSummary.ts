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
  lengthOfStayDays: faker.number.int({ min: 1, max: 84 }),
  expectedArrivalDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1 })),
  actualArrivalDate: faker.helpers.maybe(() => DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 60 }))),
}))
