import type { Cas1PremisesSummary, Cas1SpaceBookingSummary, FullPerson } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'
import paths from '../../../server/paths/manage'
import { laoName } from '../../../server/utils/personUtils'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Cas1PremisesSummary) {
    super(premises.name)
  }

  static visit(premises: Cas1PremisesSummary): PremisesShowPage {
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
    placements.forEach(({ person, canonicalArrivalDate, canonicalDepartureDate, tier }) => {
      cy.get('.govuk-table__body').contains(person.crn).closest('.govuk-table__row').as('row')
      cy.get('@row').contains(DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' }))
      cy.get('@row').contains(DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' }))
      cy.get('@row').contains(tier)
      cy.get('@row').contains(laoName(person as unknown as FullPerson))
    })
  }

  shouldHavePlacementListLengthOf(length: number): void {
    cy.get('.govuk-table__body .govuk-table__row').should('have.length', length)
  }

  shouldHavePaginationControl(): void {
    cy.get('.govuk-pagination').contains('2')
  }

  shouldHaveTabSelected(tabTitle: string): void {
    cy.get('.moj-sub-navigation__list').contains(tabTitle).should('have.attr', 'aria-current', 'page')
  }

  shouldSelectTab(tabTitle: string): void {
    cy.get('.moj-sub-navigation__list').contains(tabTitle).click()
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
}
