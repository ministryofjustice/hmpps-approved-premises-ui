import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RoomSharingPage extends ApplyPage {
  constructor(application: Application) {
    super('Room sharing', application, 'further-considerations', 'room-sharing')
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
