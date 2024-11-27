import type { Cas1NewDeparture, Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../../page'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import apiPaths from '../../../../../server/paths/api'

export class NotesPage extends Page {
  constructor(
    private readonly placement: Cas1SpaceBooking,
    private readonly newDeparture: Cas1NewDeparture,
  ) {
    super('Record a departure')
  }

  shouldShowFormAndExpectedDepartureDate(): void {
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Expected departure date' },
        value: { text: DateFormats.isoDateToUIDate(this.placement.expectedDepartureDate) },
      },
    ])
    this.getLabel('Provide more information')
  }

  completeForm() {
    this.completeTextArea('notes', this.newDeparture.notes)
  }

  checkApiCalled() {
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.departure({
        premisesId: this.placement.premises.id,
        placementId: this.placement.id,
      }),
    ).then(body => {
      const { departureDateTime, reasonId, moveOnCategoryId, notes } = body as Cas1NewDeparture

      expect(departureDateTime).equal(this.newDeparture.departureDateTime)
      expect(reasonId).equal(this.newDeparture.reasonId)
      expect(moveOnCategoryId).equal(this.newDeparture.moveOnCategoryId)
      expect(notes).equal(this.newDeparture.notes)
    })
  }
}
