import Page from '../page'

export default class RoomSharingPage extends Page {
  constructor() {
    super('Room sharing')
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('riskToStaff', 'no')
    this.checkRadioByNameAndValue('riskToOthers', 'no')
    this.checkRadioByNameAndValue('sharingConcerns', 'yes')
    this.completeTextArea('sharingConcernsDetail', 'Some details here')
    this.checkRadioByNameAndValue('traumaConcerns', 'no')
    this.checkRadioByNameAndValue('sharingBenefits', 'no')
  }
}
