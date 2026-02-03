import { Factory } from 'fishery'
import { Cas1OASysGroup, Cas1OASysGroupName, OASysQuestion } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import oasysQuestionFactory from './oasysQuestion'
import { DateFormats } from '../../utils/dateUtils'
import { oasysGroupMapping, oasysQuestionMappping } from '../../utils/resident/riskUtils'

class Cas1OASysGroupFactory extends Factory<Cas1OASysGroup> {
  group(group: Cas1OASysGroupName) {
    return this.params({
      group,
      answers: oasysQuestionMappping[group].map(params => ({ ...params, answer: faker.lorem.paragraph() })),
    })
  }

  riskManagementPlan() {
    return this.group('riskManagementPlan')
  }

  offenceDetails() {
    return this.group('offenceDetails')
  }

  roshSummary() {
    return this.group('roshSummary')
  }

  riskToSelf() {
    return this.group('riskToSelf')
  }

  supportingInformation() {
    return this.group('supportingInformation')
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
    group: faker.helpers.arrayElement(Object.keys(oasysGroupMapping)),
    answers: oasysQuestionFactory.buildList(10),
    assessmentMetadata: {
      dateCompleted,
      dateStarted,
      hasApplicableAssessment: true,
    },
  } as Cas1OASysGroup
})

export const roshSummaryFactory = Factory.define<OASysQuestion>(options => ({
  questionNumber: options.sequence.toString(),
  label: faker.helpers.arrayElement(Object.values(oasysGroupMapping.roshSummary)),
  answer: faker.lorem.paragraph(),
}))
