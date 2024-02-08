import type { ApprovedPremisesApplication as Application, FullPerson } from '@approved-premises/api'
import { Appeal } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/apply'
import { appealSummaryListItems } from '../../../../server/utils/appealsUtils'

export default class AppealsShowPage extends Page {
  constructor(private readonly application: Application) {
    super((application.person as FullPerson).name)
  }

  static visit(application: Application, appeal: Appeal): AppealsShowPage {
    cy.visit(paths.applications.appeals.show({ id: application.id, appealId: appeal.id }))
    return new AppealsShowPage(application)
  }

  shouldShowAppealDetails(appeal: Appeal): void {
    this.shouldContainSummaryListItems(appealSummaryListItems(appeal))
  }
}
