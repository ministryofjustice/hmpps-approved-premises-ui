import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'

export default class PlacementStartPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(`the date you want the placement to start?`, application, 'basic-information', 'placement-date')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('startDateSameAsReleaseDate')
  }
}
