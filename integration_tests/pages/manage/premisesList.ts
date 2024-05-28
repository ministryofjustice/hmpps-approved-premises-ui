import type { ApprovedPremisesSummary as PremisesSummary, ProbationRegion } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class PremisesListPage extends Page {
  constructor() {
    super('Premises')
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit({ v2 } = { v2: false }): PremisesListPage {
    cy.visit(v2 ? paths.v2Manage.premises.index({}) : paths.premises.index({}))
    return new PremisesListPage()
  }

  shouldShowPremises(premises: Array<PremisesSummary>): void {
    premises.forEach((item: PremisesSummary) => {
      cy.contains(item.name)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.apCode)
          cy.get('td').eq(1).contains(item.bedCount)
          cy.get('td')
            .eq(2)
            .contains('View')
            .should('have.attr', 'href', paths.premises.show({ premisesId: item.id }))
        })
    })
  }

  shouldNotShowPremises(premises: Array<PremisesSummary>): void {
    premises.forEach((item: PremisesSummary) => {
      cy.get('td').should('not.contain', item.name)
    })
  }

  filterPremisesByRegion(region: ProbationRegion['name']): void {
    cy.get('#region').select(region)
    this.clickSubmit()
  }
}
