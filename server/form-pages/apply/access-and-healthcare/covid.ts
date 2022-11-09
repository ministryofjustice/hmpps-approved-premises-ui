import type { TaskListErrors, YesNoOrIDK } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'

export default class Covid implements TasklistPage {
  name = 'covid'

  title = 'Healthcare information'

  body: {
    fullyVaccinated: YesNoOrIDK
    highRisk: YesNoOrIDK
    additionalCovidInfo: string
  }

  questions = {
    fullyVaccinated: {
      question: `Has ${this.application.person.name} been fully vaccinated for COVID-19?`,
      hint: `A person is considered fully vaccinated if they have had two doses and a booster of a COVID-19 vaccine.`,
    },
    highRisk: {
      question: `Is the ${this.application.person.name} at high risk from COVID-19?`,
      hint: `This includes autoimmune diseases and those eligible for nMAB treatment.`,
    },
    additionalCovidInfo: 'Other considerations and comments on COVID-19',
  }

  constructor(
    body: Record<string, unknown>,
    private readonly application: Application,
    private readonly previousPage: string,
  ) {
    this.body = {
      fullyVaccinated: body.fullyVaccinated as YesNoOrIDK,
      highRisk: body.highRisk as YesNoOrIDK,
      additionalCovidInfo: body.additionalCovidInfo as string,
    }
  }

  previous() {
    return this.previousPage
  }

  next() {
    return ''
  }

  response() {
    const response = {
      [this.questions.fullyVaccinated.question]: sentenceCase(this.body.fullyVaccinated),
      [this.questions.highRisk.question]: sentenceCase(this.body.highRisk),
    }
    if (this.body.additionalCovidInfo) {
      return { ...response, [this.questions.additionalCovidInfo]: this.body.additionalCovidInfo }
    }
    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.fullyVaccinated) {
      errors.fullyVaccinated = `You must confirm if ${this.application.person.name} has been fully vaccinated`
    }

    if (!this.body.highRisk) {
      errors.highRisk = `You must confirm if ${this.application.person.name} is at high risk from COVID-19`
    }

    return errors
  }
}
