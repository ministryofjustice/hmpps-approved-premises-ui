import Page from '../page'
import { Person } from '../../../server/@types/shared'

export default class ConvictedOffences extends Page {
  constructor(person: Person) {
    super(`Has ${person.name} ever been convicted of the following offences?`)
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('response', 'yes')
  }
}
