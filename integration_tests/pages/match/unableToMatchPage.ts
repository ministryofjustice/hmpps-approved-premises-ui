import Page from '../page'

export default class UnableToMatch extends Page {
  constructor() {
    super('Unable to match')
  }

  completeForm(): void {
    this.completeTextArea('notes', 'I am unable to match this person')
  }
}
