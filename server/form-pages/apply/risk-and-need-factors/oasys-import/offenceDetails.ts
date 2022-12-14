import type { DataServices, PersonRisksUI } from '@approved-premises/ui'

import type { Application, ArrayOfOASysOffenceDetailsQuestions, OASysSections } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'

type OffenceDetailsBody = {
  offenceDetailsAnswers: Array<string> | Record<string, string>
  offenceDetailsSummaries: ArrayOfOASysOffenceDetailsQuestions
}

@Page({
  name: 'offence-details',
  bodyProperties: ['offenceDetailsAnswers', 'offenceDetailsSummaries'],
})
export default class OffenceDetails implements TasklistPage {
  title = 'Edit risk information'

  offenceDetailsSummaries: OffenceDetailsBody['offenceDetailsSummaries']

  offenceDetailsAnswers: OffenceDetailsBody['offenceDetailsAnswers']

  risks: PersonRisksUI

  constructor(public body: Partial<OffenceDetailsBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: Application,
    token: string,
    dataServices: DataServices,
  ) {
    const oasysSections: OASysSections = await dataServices.personService.getOasysSections(
      token,
      application.person.crn,
    )
    const risks = await dataServices.personService.getPersonRisks(token, application.person.crn)

    const offenceDetails = oasysSections.offenceDetails.sort(
      (a, b) => Number(a.questionNumber) - Number(b.questionNumber),
    )

    body.offenceDetailsSummaries = offenceDetails

    const page = new OffenceDetails(body)
    page.offenceDetailsSummaries = offenceDetails
    page.risks = risks

    return page
  }

  previous() {
    return 'rosh-summary'
  }

  next() {
    return ''
  }

  response() {
    return oasysImportReponse(this.body.offenceDetailsAnswers, this.body.offenceDetailsSummaries)
  }

  errors() {
    return {}
  }
}
