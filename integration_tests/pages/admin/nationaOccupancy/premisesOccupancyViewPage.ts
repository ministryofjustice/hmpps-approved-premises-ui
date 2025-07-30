import type { Cas1Premises } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

export default class PremisesOccupancyViewPage extends Page {
  constructor(title: string) {
    super(title)
  }

  static visit(premises: Cas1Premises): PremisesOccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }))
    return new PremisesOccupancyViewPage(`View spaces in ${premises.name}`)
  }

  static visitUnauthorised(premises: Cas1Premises): PremisesOccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }), {
      failOnStatusCode: false,
    })
    return new PremisesOccupancyViewPage(`Authorisation Error`)
  }

  shouldBePopulatedWith({ durationText, arrivalDate }: { durationText: string; arrivalDate: string }) {
    cy.get('.search-and-filter').within(() => {
      this.verifyTextInputContentsById('arrivalDate', arrivalDate)
      this.shouldHaveSelectText('durationDays', durationText)
    })
  }
}
