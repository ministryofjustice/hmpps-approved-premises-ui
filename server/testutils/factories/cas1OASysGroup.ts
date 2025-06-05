import { Factory } from 'fishery'
import { Cas1OASysGroup, OASysQuestion } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import oasysQuestionFactory from './oasysQuestion'
import { DateFormats } from '../../utils/dateUtils'

class Cas1OASysGroupFactory extends Factory<Cas1OASysGroup> {
  riskManagementPlan() {
    return this.params({
      group: 'riskManagementPlan',
      answers: riskManagementPlanFactory.buildList(5),
    })
  }

  offenceDetails() {
    return this.params({
      group: 'offenceDetails',
      answers: offenceDetailsFactory.buildList(5),
    })
  }

  roshSummary() {
    return this.params({
      group: 'roshSummary',
      answers: roshSummaryFactory.buildList(5),
    })
  }

  riskToSelf() {
    return this.params({
      group: 'riskToSelf',
      answers: riskToSelfFactory.buildList(5),
    })
  }

  supportingInformation() {
    return this.params({
      group: 'supportingInformation',
    })
  }
}

export default Cas1OASysGroupFactory.define(() => {
  const dateCompleted = DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 5 }))
  const dateStarted = DateFormats.dateObjToIsoDateTime(faker.date.recent({ days: 5, refDate: dateCompleted }))
  return {
    group: faker.helpers.arrayElement([
      'riskManagementPlan',
      'offenceDetails',
      'roshSummary',
      'supportingInformation',
      'riskToSelf',
    ]),
    answers: oasysQuestionFactory.buildList(10),
    assessmentMetadata: {
      dateCompleted,
      dateStarted,
    },
  } as Cas1OASysGroup
})

const riskManagementPlanFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Key information about current situation',
    'Further considerations about current situation',
    'Supervision',
    'Monitoring and control',
    'Intervention and treatment',
    'Victim safety planning',
    'Contingency plans',
    'Additional comments',
  ]),
  answer: faker.lorem.paragraph(),
}))

const offenceDetailsFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Briefly describe the details of the offence(s)',
    'Others involved',
    'Identify issues related to the offence that contribute to the risk of offending and harm. Please include any positive factors',
    'Provide evidence of the motivation and triggers for the offending',
    'Provide details of the impact on the victim',
    'Victim Information',
    'Is there a pattern of offending? Consider details of previous convictions',
  ]),
  answer: faker.lorem.paragraph(),
}))

export const riskToSelfFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement([
    'Current concerns of self harm and suicide',
    'Previous concerns of self harm and suicide',
    'Current concerns about coping in a hostel setting',
    'Previous concerns about coping in a hostel setting',
    'Risk of serious harm',
  ]),
  answer: faker.lorem.paragraph(),
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

// export const supportingInformationFactory = Factory.define<OASysSupportingInformationQuestion>(options => {
//   const oasysSelection = oasysSelectionFactory.build()
//
//   return {
//     ...oasysSelection,
//     questionNumber: options.sequence.toString(),
//     label: oasysSelection.name,
//     answer: faker.lorem.paragraph(),
//   }
// })
