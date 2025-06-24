import type { Cas1CruManagementArea, Cas1PremisesBasicSummary } from '@approved-premises/api'

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
        .closest('tr')
        .within(() => {
          cy.get('th')
            .contains(item.name)
            .should('have.attr', 'href', paths.premises.show({ premisesId: item.id }))
          cy.get('td').eq(0).contains(item.apCode)
          cy.get('td').eq(1).contains(item.bedCount)
        })
    })
  }

  filterPremisesByArea(area: Cas1CruManagementArea['name']): void {
    cy.get('#selectedArea').select(area)
    this.clickButton('Apply filter')
  }
}
