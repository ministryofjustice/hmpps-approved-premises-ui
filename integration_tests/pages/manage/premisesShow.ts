import type { Cas1Premises, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'
import paths from '../../../server/paths/manage'
import { displayName } from '../../../server/utils/personUtils'
import { canonicalDates, detailedStatus, statusTextMap } from '../../../server/utils/placements'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Cas1Premises) {
    super(premises.name)
  }

  static visit(premises: Cas1Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  shouldShowAPArea(apArea: string): void {
    cy.get('span').should('contain', apArea)
  }

  shouldShowPremisesDetail(): void {
    cy.get('.govuk-summary-list__key')
      .contains('Code')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.apCode)

    cy.get('.govuk-summary-list__key')
      .contains('Postcode')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.postcode)

    cy.get('.govuk-summary-list__key')
      .contains('Number of Beds')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.bedCount)

    cy.get('.govuk-summary-list__key')
      .contains('Available Beds')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.availableBeds)
  }

  shouldShowListOfPlacements(placements: Array<Cas1SpaceBookingSummary>): void {
    ;['Name and CRN', 'Arrival date', 'Departure date', 'Key worker'].forEach(heading => {
      cy.get('.govuk-table .govuk-table__head').contains(heading)
    })

    placements.forEach(placement => {
      const { person, tier } = placement
      const { arrivalDate, departureDate } = canonicalDates(placement)

      cy.get('.govuk-table__body').contains(person.crn).closest('.govuk-table__row').as('row')
      cy.get('@row').contains(DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }))
      cy.get('@row').contains(DateFormats.isoDateToUIDate(departureDate, { format: 'short' }))
      cy.get('@row').contains(tier)
      cy.get('@row').contains(displayName(person))
      cy.get('@row').contains(statusTextMap[detailedStatus(placement)])
    })
  }

  shouldHavePlacementListLengthOf(length: number): void {
    cy.get('.govuk-table__body .govuk-table__row').should('have.length', length)
  }

  shouldHavePaginationControl(): void {
    cy.get('.govuk-pagination').contains('2')
    cy.get('.govuk-pagination').contains('Next')
  }

  shouldNotShowPlacementsSection(): void {
    cy.contains('All bookings').should('not.exist')
    cy.get('.moj-sub-navigation__list').should('not.exist')
  }

  shouldNotShowPlacementsResultsTable(): void {
    cy.get('.govuk-table').should('not.exist')
  }

  shouldShowSearchForm(crnOrName?: string) {
    this.getLabel('Search for a booking')

    if (crnOrName) {
      this.verifyTextInputContentsById('crnOrName', crnOrName)
    }
  }

  searchByCrnOrName(crnOrName: string) {
    this.clearAndCompleteTextInputById('crnOrName', crnOrName)
    cy.get('button').contains('Search').click()
  }

  shouldShowNoResults() {
    cy.get('p').contains('There are no results for your search.').should('exist')
  }

  selectKeyworker(keyworkerName: string) {
    this.getSelectInputByIdAndSelectAnEntry('keyworker', keyworkerName)
  }

  shouldShowInEveryTableRow(name: string) {
    cy.get('tbody tr').then($rows => {
      $rows.each(key => {
        expect($rows[key].textContent).to.contain(name)
      })
    })
  }
}
