import { Factory } from 'fishery'
import { Cas1OASysGroup, OASysQuestion } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import oasysQuestionFactory from './oasysQuestion'
import { DateFormats } from '../../utils/dateUtils'

class Cas1OASysGroupFactory extends Factory<Cas1OASysGroup> {
  riskManagementPlan() {
    return this.params({
      group: 'riskManagementPlan',
      answers: [
        { label: 'Further considerations', questionNumber: 'RM28' },
        { label: 'Additional comments', questionNumber: 'RM35' },
        { label: 'Contingency plans', questionNumber: 'RM34' },
        { label: 'Victim safety planning', questionNumber: 'RM33' },
        { label: 'Interventions and treatment', questionNumber: 'RM32' },
        { label: 'Monitoring and control', questionNumber: 'RM31' },
        { label: 'Supervision', questionNumber: 'RM30' },
        { label: 'Key information about current situation', questionNumber: 'RM28.1' },
      ].map(params => ({ ...params, answer: faker.lorem.paragraph() })),
    })
  }

  offenceDetails() {
    return this.params({
      group: 'offenceDetails',
      answers: [
        { label: 'Offence analysis', questionNumber: '2.1' },
        { label: 'Victim - perpetrator relationship', questionNumber: '2.4.1' },
        { label: 'Other victim information', questionNumber: '2.4.2' },
        { label: 'Impact on the victim', questionNumber: '2.5' },
        { label: 'Motivation and triggers', questionNumber: '2.8.3' },
        { label: 'Issues contributing to risks', questionNumber: '2.98' },
        { label: 'Pattern of offending', questionNumber: '2.12' },
      ].map(params => offenceDetailsFactory.build(params)),
    })
  }

  roshSummary() {
    const answers = [
      { label: 'Who is at risk', questionNumber: 'R10.1' },
      { label: 'What is the nature of the risk', questionNumber: 'R10.2' },
      { label: 'Circumstances or situations where offending is most likely to occur', questionNumber: 'SUM11' },
      { label: 'Analysis of risk factors', questionNumber: 'SUM9' },
      { label: 'Strengths and protective factors', questionNumber: 'SUM10' },
    ].map(params => roshSummaryFactory.build(params))
    return this.params({
      group: 'roshSummary',
      answers,
    })
  }

  riskToSelf() {
    const answers = [
      { label: 'Analysis of current or previous self-harm and/or suicide concerns', questionNumber: 'FA62' },
      { label: 'Coping in custody / approved premises / hostel / secure hospital', questionNumber: 'FA63' },
      { label: 'Analysis of vulnerabilities', questionNumber: 'FA64' },
    ].map(params => riskToSelfFactory.build(params))
    return this.params({
      group: 'riskToSelf',
      answers,
    })
  }

  supportingInformation() {
    return this.params({
      group: 'supportingInformation',
      answers: [
        { label: 'Accommodation issues contributing to risks of offending and harm', questionNumber: '3.9' },
        { label: 'Relationship issues contributing to risks of offending and harm', questionNumber: '6.9' },
        { label: 'Lifestyle issues contributing to risks of offending and harm', questionNumber: '7.9' },
        { label: 'Drug misuse issues contributing to risks of offending and harm', questionNumber: '8.9' },
        { label: 'Alcohol misuse issues contributing to risks of offending and harm', questionNumber: '9.9' },
        { label: 'Issues of emotional well-being contributing to risks of offending and harm', questionNumber: '10.9' },
        { label: 'Thinking / behavioural issues contributing to risks of offending and harm', questionNumber: '11.9' },
        { label: 'Issues about attitudes contributing to risks of offending and harm', questionNumber: '12.9' },
        { label: 'General Health - Any physical or mental health conditions', questionNumber: '13.1' },
      ].map(params => ({ ...params, answer: faker.lorem.paragraph() })),
    })
  }

  noAssessment() {
    return this.params({
      assessmentMetadata: {
        dateCompleted: null,
        dateStarted: null,
        hasApplicableAssessment: false,
      },
      answers: oasysQuestionFactory.buildList(10, { answer: null }),
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
      hasApplicableAssessment: true,
    },
  } as Cas1OASysGroup
})

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
