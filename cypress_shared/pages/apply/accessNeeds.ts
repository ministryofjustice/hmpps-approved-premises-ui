import { faker } from '@faker-js/faker/locale/en_GB'

import Page from '../page'

export default class AccessNeedsPage extends Page {
  constructor() {
    super('Access needs')
  }

  checkAdditionalNeedsBoxes() {
    this.checkCheckboxByNameAndValue('additionalNeeds', 'mobility')
    this.checkCheckboxByNameAndValue('additionalNeeds', 'learningDisability')
    this.checkCheckboxByNameAndValue('additionalNeeds', 'neurodivergentConditions')
  }

  completeReligiousAndCulturalNeedsSection() {
    this.checkRadioByNameAndValue('religiousOrCulturalNeeds', 'yes')
    this.getTextInputByIdAndEnterDetails('religiousOrCulturalNeedsDetails', faker.lorem.words())
  }

  completeNeedsInterpreterSection() {
    this.checkRadioByNameAndValue('needsInterpreter', 'yes')
    this.getTextInputByIdAndEnterDetails('interpreterLanguage', faker.lorem.words())
  }

  completeForm() {
    this.checkAdditionalNeedsBoxes()
    this.completeReligiousAndCulturalNeedsSection()
    this.completeNeedsInterpreterSection()
    this.checkRadioByNameAndValue('careActAssessmentCompleted', 'yes')
  }
}
