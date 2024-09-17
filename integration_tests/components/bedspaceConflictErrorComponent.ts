import type { Booking, Cas1OutOfServiceBed, LostBed } from '@approved-premises/api'
import errorLookups from '../../server/i18n/en/errors.json'
import Page from '../pages/page'
import BookingShowPage from '../pages/manage/booking/show'
import { OutOfServiceBedShowPage } from '../pages/v2Manage/outOfServiceBeds/outOfServiceBedShow'

export default class BedspaceConflictErrorComponent {
  constructor(
    private readonly premisesId: string,
    private readonly source: 'booking' | 'lost-bed',
  ) {}

  shouldShowDateConflictErrorMessages(
    fields: Array<string>,
    conflictingEntity: Booking | LostBed | Cas1OutOfServiceBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    fields.forEach(field => {
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[field].conflict)
    })

    const title = this.getTitle(fields, conflictingEntityType)
    const message = this.getMessage(fields, conflictingEntityType)

    cy.get('.govuk-error-summary h2').should('contain', title)
    cy.get('.govuk-error-summary ul').should('contain', message)

    cy.get('.govuk-error-summary a').click()

    if (conflictingEntityType === 'booking') {
      Page.verifyOnPage(BookingShowPage, [this.premisesId, conflictingEntity as Booking])
    } else {
      Page.verifyOnPage(OutOfServiceBedShowPage, this.premisesId, conflictingEntity as Cas1OutOfServiceBed)
    }

    cy.go('back')
  }

  private getTitle(fields: Array<string>, conflictingEntityType: 'booking' | 'lost-bed'): string {
    return (
      conflictingEntityType === 'lost-bed'
        ? 'Out of service bed record cannot be created for the $date$ entered'
        : 'This bedspace is not available for the $date$ entered'
    ).replace('$date$', fields.length === 1 ? 'date' : 'dates')
  }

  private getMessage(fields: Array<string>, conflictingEntityType: 'booking' | 'lost-bed'): string {
    const noun = conflictingEntityType === 'booking' ? 'booking' : 'out of service beds record'

    return fields.length === 1 ? `It conflicts with an existing ${noun}` : `They conflict with an existing ${noun}`
  }
}
