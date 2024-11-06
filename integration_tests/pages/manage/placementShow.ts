import { Cas1PremisesSummary, Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/manage'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class PlacementShowPage extends Page {
  constructor(placement: Cas1SpaceBooking) {
    const pageHeading = `${DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' })}`
    super(pageHeading)
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit(premisesId: string, placement: Cas1SpaceBooking): PlacementShowPage {
    cy.visit(paths.premises.placements.show({ premisesId, placementId: placement.id }))
    return new PlacementShowPage(placement)
  }

  shouldShowPersonHeader(placement: Cas1SpaceBooking): void {
    const { name, crn, dateOfBirth } = placement.person as FullPerson
    cy.get('.key-details-bar').should('contain', name)
    cy.get('.key-details-bar').should('contain', crn)
    cy.get('.key-details-bar').should('contain', DateFormats.isoDateToUIDate(dateOfBirth, { format: 'short' }))
  }

  shouldShowSummaryInformation(placement: Cas1SpaceBooking, premises: Cas1PremisesSummary): void {
    ;[
      ['Delius Event Number', placement.deliusEventNumber],
      ['AP name', premises.name],
      ['Key worker', placement.keyWorkerAllocation.keyWorker.name],
      ['Expected arrival date', DateFormats.isoDateToUIDate(placement.expectedArrivalDate)],
      ['Expected departure date', DateFormats.isoDateToUIDate(placement.expectedDepartureDate)],
    ].forEach(([title, expectedText]) => {
      cy.contains(title).closest('.govuk-summary-list__row').should('contain', expectedText)
    })
  }
}
