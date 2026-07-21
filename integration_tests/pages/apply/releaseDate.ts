import type { Cas1Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ReleaseDatePage extends ApplyPage {
  constructor(application: Cas1Application) {
    super(`Do you know the person's release date?`, application, 'basic-information', 'release-date')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('knowReleaseDate')
    this.completeDateInputsFromPageBody('releaseDate')
  }
}
