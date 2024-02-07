import type { ApprovedPremisesApplication as Application, FullPerson, NewAppeal } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/apply'

export default class AppealsPage extends Page {
  constructor(private readonly application: Application) {
    super((application.person as FullPerson).name)
  }

  static visit(application: Application): AppealsPage {
    cy.visit(paths.applications.appeals.new({ id: application.id }))
    return new AppealsPage(application)
  }

  completeForm(appeal: NewAppeal): void {
    this.completeDateInputs('appealDate', appeal.appealDate)
    this.completeTextArea('appeal[appealDetail]', appeal.appealDetail)
    this.completeTextArea('appeal[reviewer]', appeal.reviewer)
    this.checkRadioByNameAndValue('appeal[decision]', appeal.decision)
    this.completeTextArea('appeal[decisionDetail]', appeal.decisionDetail)
    this.clickSubmit()
  }
}
