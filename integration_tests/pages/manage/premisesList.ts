import type { Cas1PremisesBasicSummary } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class PremisesListPage extends Page {
  constructor() {
    super('Premises')
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.index({}))
    return new PremisesListPage()
  }

  shouldShowPremises(premises: Array<Cas1PremisesBasicSummary>): void {
    premises.forEach((item: Cas1PremisesBasicSummary) => {
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

  shouldNotShowPremises(premises: Array<Cas1PremisesBasicSummary>): void {
    premises.forEach((item: Cas1PremisesBasicSummary) => {
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
