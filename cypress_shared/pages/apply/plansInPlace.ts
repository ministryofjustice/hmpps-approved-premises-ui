import Page from '../page'

export default class PlansInPlacePage extends Page {
  constructor() {
    super('Placement duration and move on')
  }

  completeForm() {
    this.checkCheckboxByNameAndValue('arePlansInPlace', 'yes')
  }
}
