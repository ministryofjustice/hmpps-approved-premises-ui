import Page from '../page'

export default class AccessNeedsAdditionalAdjustmentsPage extends Page {
  constructor() {
    super('Access needs')
    cy.get('legend').contains(
      /Does the placement require adjustments for the mobility, learning disability and neurodivergent conditions needs you selected?/,
    )
  }

  completeForm() {
    this.checkRadioByNameAndValue('adjustments', 'yes')
    this.completeTextArea('adjustmentsDetail', 'Some details here')
  }
}
