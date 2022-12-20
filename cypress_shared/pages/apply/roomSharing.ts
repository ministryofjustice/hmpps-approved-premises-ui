import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RoomSharingPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Room sharing',
      application,
      'further-considerations',
      'room-sharing',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('riskToStaff')
    this.checkRadioButtonFromPageBody('riskToOthers')
    this.checkRadioButtonFromPageBody('sharingConcerns')
    this.completeTextInputFromPageBody('sharingConcernsDetail')
    this.checkRadioButtonFromPageBody('traumaConcerns')
    this.checkRadioButtonFromPageBody('sharingBenefits')
  }
}
