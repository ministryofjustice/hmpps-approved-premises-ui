import { ApprovedPremisesApplication } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class TypeOfApPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Which type of AP does the person require?`,
      application,
      'type-of-ap',
      'ap-type',
      paths.applications.show({ id: application.id }),
    )
  }

  shouldNotShowMentalHealthAps() {
    cy.get(`input[name="type"][value="mhapElliottHouse"]`).should('not.exist')
    cy.get(`input[name="type"][value="mhapStJosephs"]`).should('not.exist')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('type')
  }
}
