import { Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { ResidentProfileTab } from '../../../../server/utils/resident'

export default class ResidentProfilePage extends Page {
  constructor(
    private placement: Cas1SpaceBooking,
    title = 'Manage a resident',
  ) {
    super(title)
    this.checkPhaseBanner()
  }

  static visit(placement: Cas1SpaceBooking, tab: ResidentProfileTab = null): ResidentProfilePage {
    const params = { crn: placement.person.crn, placementId: placement.id }
    const path = (() => {
      switch (tab) {
        case 'personal':
          return paths.resident.tabPersonal(params)
        case 'health':
          return paths.resident.tabHealth(params)
        case 'placement':
          return paths.resident.tabPlacement(params)
        case 'risk':
          return paths.resident.tabRisk(params)
        case 'sentence':
          return paths.resident.tabSentence(params)
        case 'enforcement':
          return paths.resident.tabEnforcement(params)

        default:
          return paths.resident.show(params)
      }
    })()

    cy.visit(path)
    return new ResidentProfilePage(placement)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): ResidentProfilePage {
    cy.visit(paths.resident.show({ crn: placement.person.crn, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new ResidentProfilePage(undefined, `Authorisation Error`)
  }

  checkHeader() {
    this.shouldShowPersonHeader(this.placement.person as FullPerson)
  }
}
