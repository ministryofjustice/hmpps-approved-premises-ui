import { faker } from '@faker-js/faker'
import type { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

export class RecordNonArrivalPage extends Page {
  constructor(title: string = 'Record someone as not arrived') {
    super(title)
  }

  shouldShowReasonError(): void {
    cy.get('.govuk-error-summary__list').should('contain', 'You must select a reason for non-arrival')
  }

  shouldShowTextError(): void {
    cy.get('.govuk-error-summary__list').should('contain', 'You have exceeded 200 characters')
  }

  completeNotesBad(): void {
    // Generate a text string of exactly 250 chars with no trailing space - so we have a repeatable error message
    const words = faker.lorem.words(100).substring(0, 250).trim()
    const text = words + 'abc'.substring(0, 250 - words.length)
    this.completeTextArea('notes', text)
  }

  completeNotesGood(): void {
    this.completeTextArea('notes', faker.lorem.words(20).substring(0, 200))
  }

  checkForCharacterCountError(): void {
    cy.contains('You have 50 characters too many')
  }

  completeReason(): void {
    cy.get('input[name=reason]')
      .invoke('val')
      .then(val => {
        this.checkRadioByNameAndValue('reason', String(val))
      })
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): RecordNonArrivalPage {
    cy.visit(paths.premises.placements.nonArrival({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new RecordNonArrivalPage(`Authorisation Error`)
  }
}
