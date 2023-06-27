import type { TaskListErrors, YesOrNo, YesOrNoWithDetail } from '@approved-premises/ui'
import { sentenceCase } from '../../../../utils/utils'
import { yesOrNoResponseWithDetailForYes } from '../../../utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type CovidBody = {
  immunosuppressed: YesOrNo
} & YesOrNoWithDetail<'boosterEligibility'>

@Page({ name: 'covid', bodyProperties: ['boosterEligibility', 'boosterEligibilityDetail', 'immunosuppressed'] })
export default class Covid implements TasklistPage {
  name = 'covid'

  title = 'COVID information'

  questions = {
    boosterEligibility: {
      question: 'Is the person eligible for COVID-19 vaccination boosters?',
      hint: `The person may be eligible for a booster because of their age, or if they have an underlying health condition`,
    },
    boosterEligibilityDetail: 'Why is the person eligible for a COVID-19 booster?',
    immunosuppressed: {
      question: `Is the person immunosuppressed, eligible for nMAB treatment or higher risk as per the definitions in the COVID-19 guidance?`,
      info: `This person will require a single room in an Approved Premises.`,
      guidance: {
        text: `View the government's guidance on COVID-19`,
        href: `https://www.gov.uk/government/publications/covid-19-guidance-for-people-whose-immune-system-means-they-are-at-higher-risk/covid-19-guidance-for-people-whose-immune-system-means-they-are-at-higher-risk`,
      },
    },
  }

  constructor(public body: Partial<CovidBody>, private readonly previousPage: string) {}

  previous() {
    return this.previousPage
  }

  next() {
    return ''
  }

  response() {
    const response = {
      [this.questions.boosterEligibility.question]: yesOrNoResponseWithDetailForYes<'boosterEligibility'>(
        'boosterEligibility',
        this.body,
      ),
      [this.questions.immunosuppressed.question]: sentenceCase(this.body.immunosuppressed),
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.boosterEligibility) {
      errors.boosterEligibility = `You must confirm if the person is eligible for a COVID-19 booster`
    }

    if (this.body.boosterEligibility === 'yes' && !this.body.boosterEligibilityDetail) {
      errors.boosterEligibilityDetail = `You must specify why the person is eligible for a COVID-19 booster`
    }

    if (!this.body.immunosuppressed) {
      errors.immunosuppressed = `You must confirm if the person is immunosuppressed, eligible for nMAB treatment or higher risk`
    }

    return errors
  }
}
