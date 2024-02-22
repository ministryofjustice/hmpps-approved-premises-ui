import type { ApprovedPremisesApplication as Application, FullPerson, NewAppeal } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/apply'

export default class AppealsNewPage extends Page {
  constructor(private readonly application: Application) {
    super((application.person as FullPerson).name)
  }

  static visit(application: Application): AppealsNewPage {
    cy.visit(paths.applications.appeals.new({ id: application.id }))
    return new AppealsNewPage(application)
  }

  completeForm(appeal: NewAppeal): void {
    this.completeDateInputs('appealDate', appeal.appealDate)
    this.completeTextArea('appeal[appealDetail]', appeal.appealDetail)
    this.checkRadioByNameAndValue('appeal[decision]', appeal.decision)
    this.completeTextArea('appeal[decisionDetail]', appeal.decisionDetail)
    this.clickSubmit()
  }
}
