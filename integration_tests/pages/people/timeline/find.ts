import { Person } from '../../../../server/@types/shared'
import Page from '../../page'

export class FindPage extends Page {
  person: Person

  constructor(person: Person) {
    super("Find someone's application history")
    this.person = person
  }

  enterCrn() {
    this.getTextInputByIdAndEnterDetails('crn', this.person.crn)
  }
}
