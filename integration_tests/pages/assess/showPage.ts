import type { Cas1Assessment, FullPerson } from '@approved-premises/api'

import Page from '../page'

export default class ShowPage extends Page {
  constructor(private readonly assessment: Cas1Assessment) {
    super('View Assessment')
  }

  shouldShowPersonInformation() {
    this.shouldShowPersonDetails(
      this.assessment.application.person as FullPerson,
      this.assessment.application.personStatusOnSubmission,
    )
  }

  shouldShowResponses() {
    this.shouldShowCheckYourAnswersResponses(this.assessment)
  }
}
