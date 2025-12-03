import { ActiveOffence, Cas1OASysGroup, Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { getResidentStatus, ResidentProfileTab } from '../../../../server/utils/resident'
import { DateFormats } from '../../../../server/utils/dateUtils'

import { offenceSummaryList } from '../../../../server/utils/resident/sentence'

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
    const { path, title } = (() => {
      switch (tab) {
        case 'personal':
          return { path: paths.resident.tabPersonal(params), title: 'Personal' }
        case 'health':
          return { path: paths.resident.tabHealth(params), title: 'Health' }
        case 'placement': {
          const placementParams = { ...params, section: 'placement-details' }
          return { path: paths.resident.tabPlacement(placementParams), title: 'Placement' }
        }
        case 'risk':
          return { path: paths.resident.tabRisk(params), title: 'Risk' }
        case 'sentence':
          return { path: paths.resident.tabSentence({ ...params, section: 'offence' }), title: 'Sentence' }
        case 'enforcement':
          return { path: paths.resident.tabEnforcement(params), title: 'Enforcement' }

        default:
          return { path: paths.resident.show(params), title: 'Personal' }
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

  shouldShowOffencesInformation(offences: Array<ActiveOffence>, oasysOffenceDetails: Cas1OASysGroup) {
    cy.get('.govuk-summary-card__title').contains('Offence').should('exist')
    const expected = offenceSummaryList(offences, { ...oasysOffenceDetails, answers: [] })
    expected.splice(2, 1)
    expected.splice(5, 1)

    this.shouldContainSummaryListItems(expected)
  }

  shouldShowPlacementSideNavigation() {
    cy.get('.moj-side-navigation').within(() => {
      cy.get('a').contains('Placement details').should('exist')
      cy.get('a').contains('Application').should('exist')
      cy.get('a').contains('Previous AP stays').should('exist')
      cy.get('a').contains('Pre-arrival').should('exist')
      cy.get('a').contains('Induction').should('exist')
      cy.get('a').contains('Reviews').should('exist')
    })
  }
}
