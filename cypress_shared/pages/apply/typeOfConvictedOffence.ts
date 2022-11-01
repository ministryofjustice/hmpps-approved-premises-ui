import Page from '../page'
import { Person } from '../../../server/@types/shared'

export default class TypeOfConvictedOffence extends Page {
  constructor(person: Person) {
    super(`What type of offending has ${person.name} been convicted of?`)
  }

  completeForm(): void {
    this.checkCheckboxByNameAndValue('offenceConvictions', 'arson')
    this.checkCheckboxByNameAndValue('offenceConvictions', 'sexualOffence')
    this.checkCheckboxByNameAndValue('offenceConvictions', 'hateCrimes')
    this.checkCheckboxByNameAndValue('offenceConvictions', 'childNonSexualOffence')
  }
}
