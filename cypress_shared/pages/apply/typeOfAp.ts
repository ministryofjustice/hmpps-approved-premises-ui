import { Person } from '../../../server/@types/shared'
import Page from '../page'

export default class TypeOfApPage extends Page {
  constructor(person: Person) {
    super(`Which type of AP does ${person.name} require?`)
  }

  completeForm() {
    this.checkRadioByNameAndValue('type', 'standard')
  }
}
