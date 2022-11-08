import { faker } from '@faker-js/faker/locale/en_GB'
import { Person } from '../../../server/@types/shared'

import Page from '../page'

export default class AccessNeedsMobilityPage extends Page {
  constructor(person: Person) {
    super('Access needs')
    cy.get('.govuk-form-group').contains(`Does ${person.name} require use of a wheelchair?`)
  }

  completeForm() {
    this.checkRadioByNameAndValue('needsWheelchair', 'yes')
    this.getTextInputByIdAndEnterDetails('mobilityNeeds', faker.lorem.word())
    this.getTextInputByIdAndEnterDetails('visualImpairment', faker.lorem.word())
  }
}
