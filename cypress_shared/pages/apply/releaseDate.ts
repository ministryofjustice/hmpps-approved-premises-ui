import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ReleaseDatePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(`Do you know ${application.person.name}’s release date?`, application, 'basic-information', 'release-date')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('knowReleaseDate')
    this.completeDateInputsFromPageBody('releaseDate')
  }
}
