import type { ApprovedPremisesApplication as Application, NewAppeal } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/apply'
import { displayName } from '../../../../server/utils/personUtils'

export default class AppealsNewPage extends Page {
  constructor(readonly application: Application) {
    super(displayName(application.person))
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
