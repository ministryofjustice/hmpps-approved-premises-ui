import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { OASysQuestion, OASysSections } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<OASysSections>(() => ({
  assessmentId: faker.datatype.number(),
  assessmentState: faker.helpers.arrayElement(['Completed', 'Incomplete']),
  dateStarted: DateFormats.dateObjToIsoDate(faker.date.past()),
  dateCompleted: DateFormats.dateObjToIsoDate(faker.date.recent()),
  offenceDetails: offenceDetailsFactory.buildList(5),
  roshSummary: roshSummaryFactory.buildList(5),
  supportingInformation: [],
  riskToSelf: [],
  riskManagementPlan: [],
}))

export const roshSummaryFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Who is at risk?',
    'What is the nature of the risk?',
    'When is the risk likely to be greatest?',
    'What circumstances are likely to increase risk?',
  ]),
  answer: faker.lorem.paragraph(),
}))

const offenceDetailsFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Offence analysis',
    'Others involved',
    'Issues contributing to risk',
    'Motivation and triggers',
    'Victim impact',
    'Victim Information',
    'Previous offences',
  ]),
  answer: faker.lorem.paragraph(),
}))
