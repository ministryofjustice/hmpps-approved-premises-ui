import type { DataServices, OASysSectionUIArray, PersonRisksUI } from '@approved-premises/ui'

import type { ApprovedPremisesApplication } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse, sortOasysImportSummaries } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type OffenceDetailsBody = {
  offenceDetailsAnswers: Array<string> | Record<string, string> | null
  offenceDetailsSummaries: OASysSectionUIArray
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

  oasysCompleted: string

  constructor(public body: Partial<OffenceDetailsBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    const oasysSections = await dataServices.personService.getOasysSections(token, application.person.crn)

    const offenceDetails = sortOasysImportSummaries(oasysSections.offenceDetails)

    body.offenceDetailsSummaries = offenceDetails

    const page = new OffenceDetails(body)
    page.offenceDetailsSummaries = offenceDetails as OASysSectionUIArray
    page.oasysCompleted = oasysSections?.dateCompleted || oasysSections?.dateStarted
    page.risks = mapApiPersonRisksForUi(application.risks)

    return page
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
