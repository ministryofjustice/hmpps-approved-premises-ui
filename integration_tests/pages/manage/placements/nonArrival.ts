import { faker } from '@faker-js/faker'
import type { Cas1NonArrival, Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import apiPaths from '../../../../server/paths/api'

export class RecordNonArrivalPage extends Page {
  constructor(title: string = 'Record someone as not arrived') {
    super(title)
  }

  nonArrivalDetails: Cas1NonArrival = {
    notes: faker.lorem.words(20).substring(0, 200),
    reason: null,
  }

  completeNotesBad(): void {
    // Generate a text string of exactly 250 chars with no trailing space - so we have a repeatable error message
    const words = faker.lorem.words(100).substring(0, 250).trim()
    const text = words + 'abc'.substring(0, 250 - words.length)
    this.completeTextArea('notes', text)
  }

  completeNotesGood(): void {
    this.completeTextArea('notes', this.nonArrivalDetails.notes)
  }

  checkForCharacterCountError(): void {
    cy.contains('You have 50 characters too many')
  }

  completeReason(): void {
    cy.get('input[name=reason]')
      .invoke('val')
      .then(val => {
        this.nonArrivalDetails.reason = String(val)
        this.checkRadioByNameAndValue('reason', String(val))
      })
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): RecordNonArrivalPage {
    cy.visit(paths.premises.placements.nonArrival({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new RecordNonArrivalPage(`Authorisation Error`)
  }

  checkApiCalled(placement: Cas1SpaceBooking): void {
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.nonArrival({ premisesId: placement.premises.id, placementId: placement.id }),
    ).then(body => {
      expect(body).to.deep.equal(this.nonArrivalDetails)
    })
  }
}
