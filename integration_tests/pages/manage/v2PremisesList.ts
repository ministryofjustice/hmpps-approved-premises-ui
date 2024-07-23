import type { ApprovedPremisesSummary as PremisesSummary, ProbationRegion } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class V2PremisesListPage extends Page {
  constructor() {
    super('Premises')
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit(): V2PremisesListPage {
    cy.visit(paths.v2Manage.premises.index({}))
    return new V2PremisesListPage()
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
            .should('have.attr', 'href', paths.v2Manage.premises.show({ premisesId: item.id }))
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

  followLinkToPremisesNamed(premisesName: string): void {
    cy.contains(premisesName)
      .parent()
      .within(() => {
        cy.get('a').contains('View').click()
      })
  }
}
