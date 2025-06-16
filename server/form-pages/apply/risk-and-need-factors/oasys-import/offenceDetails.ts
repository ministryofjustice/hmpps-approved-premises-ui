import type { DataServices, OasysPage, PersonRisksUI } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, OASysQuestion } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import { getOasysSection, oasysImportReponse } from '../../../../utils/oasysImportUtils'

type OffenceDetailsBody = {
  offenceDetailsAnswers: Record<string, string>
  offenceDetailsSummaries: Array<OASysQuestion>
}

@Page({
  name: 'offence-details',
  bodyProperties: ['offenceDetailsAnswers', 'offenceDetailsSummaries'],
})
export default class OffenceDetails implements OasysPage {
  title = 'Offence details'

  riskTaskStep = 2

  offenceDetailsSummaries: OffenceDetailsBody['offenceDetailsSummaries']

  offenceDetailsAnswers: OffenceDetailsBody['offenceDetailsAnswers']

  oasysCompleted: string

  risks: PersonRisksUI

  oasysSuccess: boolean

  constructor(public body: Partial<OffenceDetailsBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    return getOasysSection(body, application, token, dataServices, OffenceDetails, {
      groupName: 'offenceDetails',
      summaryKey: 'offenceDetailsSummaries',
      answerKey: 'offenceDetailsAnswers',
    })
  }

  previous() {
    return 'rosh-summary'
  }

  next() {
    return 'supporting-information'
  }

  response() {
    return oasysImportReponse(this.body.offenceDetailsAnswers, this.body.offenceDetailsSummaries)
  }

  errors() {
    return {}
  }
}
