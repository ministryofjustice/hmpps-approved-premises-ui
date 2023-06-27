import type { Person } from '@approved-premises/api'

import Page from '../page'

export default class EnterCRNPage extends Page {
  constructor() {
    super("Enter the person's CRN")
  }

  enterCrn(crn: string): void {
    this.getTextInputByIdAndEnterDetails('crn', crn)
  }

  public shouldShowPersonNotFoundErrorMessage(person: Person): void {
    cy.get('.govuk-error-summary').should('contain', `No person with an CRN of '${person.crn}' was found`)
    cy.get(`[data-cy-error-crn]`).should('contain', `No person with an CRN of '${person.crn}' was found`)
  }

  public shouldShowPersonNotInCaseLoadErrorMessage(person: Person): void {
    cy.get('.govuk-error-summary').should('contain', `The CRN '${person.crn}' is not in your caseload`)
    cy.get(`[data-cy-error-crn]`).should('contain', `The CRN '${person.crn}' is not in your caseload`)
  }

  public shouldShowNoNomsRecordForPersonErrorMessage(person: Person): void {
    cy.get('.govuk-error-summary').should(
      'contain',
      `The CRN '${person.crn}' does not have a NOMS number. Email AP Service Support (APServiceSupport@digital.justice.gov.uk) with the person's name and CRN for help starting an AP application.`,
    )
    cy.get(`[data-cy-error-crn]`).should(
      'contain',
      `The CRN '${person.crn}' does not have a NOMS number. Email AP Service Support (APServiceSupport@digital.justice.gov.uk) with the person's name and CRN for help starting an AP application.`,
    )
  }

  public shouldShowNoOasysForPersonErrorMessage(person: Person): void {
    cy.get('.govuk-error-summary').should(
      'contain',
      `The CRN '${person.crn}' does not have an OASys record. Email AP Service Support (APServiceSupport@digital.justice.gov.uk) with the person's name and CRN for help starting an AP application.`,
    )
    cy.get(`[data-cy-error-crn]`).should(
      'contain',
      `The CRN '${person.crn}' does not have an OASys record. Email AP Service Support (APServiceSupport@digital.justice.gov.uk) with the person's name and CRN for help starting an AP application.`,
    )
  }
}
