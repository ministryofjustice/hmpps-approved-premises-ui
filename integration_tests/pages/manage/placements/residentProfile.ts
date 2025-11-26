import { Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { getResidentStatus, ResidentProfileTab } from '../../../../server/utils/resident'
import { convertToTitleCase } from '../../../../server/utils/utils'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class ResidentProfilePage extends Page {
  constructor(
    private placement: Cas1SpaceBooking,
    title: string,
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
    const title = (() => {
      switch (tab) {
        case 'personal':
          return 'Personal details'
        default:
          return convertToTitleCase(tab)
      }
    })()

    cy.visit(path)
    return new ResidentProfilePage(placement, title)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): ResidentProfilePage {
    cy.visit(paths.resident.show({ crn: placement.person.crn, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new ResidentProfilePage(undefined, `Authorisation Error`)
  }

  checkHeader() {
    const person = this.placement.person as FullPerson
    const { premises, keyWorkerAllocation, expectedArrivalDate, expectedDepartureDate } = this.placement

    const arrivalDate = DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })
    const departureDate = DateFormats.isoDateToUIDate(expectedDepartureDate, { format: 'short' })
    const status = getResidentStatus(this.placement)
    const duration = DateFormats.durationBetweenDates(expectedArrivalDate, expectedDepartureDate).ui

    cy.get('.profile-banner').within(() => {
      cy.get('h2').should('contain', person.name)
      this.shouldShowDescription('CRN', person.crn)
      this.shouldShowDescription('Approved Premises', premises.name)
      this.shouldShowDescription('Key worker', keyWorkerAllocation.name)
      this.shouldShowDescription('Arrival', arrivalDate)
      this.shouldShowDescription('Departure', departureDate)
      this.shouldShowDescription('Status', status)
      this.shouldShowDescription('Length of stay', duration)
    })
  }
}
