import {
  extendedPremisesSummaryFactory,
  nonArrivalFactory,
  referenceDataFactory,
} from '../../../server/testutils/factories'

import { PremisesShowPage } from '../../pages/manage'
import NonarrivalCreatePage from '../../pages/manage/nonarrivalCreate'
import { signIn } from '../signIn'

context('Nonarrivals', () => {
  beforeEach(() => {
    // Given I am logged in
    signIn(['workflow_manager'])
  })

  it('creates a non-arrival', () => {
    // Given I have a booking for a premises
    const nonArrivalReasons = referenceDataFactory.buildList(5)
    const premises = extendedPremisesSummaryFactory.build()
    const bookingId = 'some-uuid'
    const nonArrival = nonArrivalFactory.build({
      date: '2021-11-01',
      reason: nonArrivalReasons[1],
    })

    cy.task('stubPremisesSummary', premises)
    cy.task('stubNonArrivalCreate', { premisesId: premises.id, bookingId, nonArrival })

    cy.task('stubNonArrivalReasons', nonArrivalReasons)

    // When I mark the booking as having not arrived
    const page = NonarrivalCreatePage.visit(premises.id, bookingId)
    page.completeNonArrivalForm(nonArrival)

    // Then a non-arrival should be created in the API
    cy.task('verifyNonArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.notes).equal(nonArrival.notes)
      expect(requestBody.date).equal(nonArrival.date)
      expect(requestBody.reason).equal(nonArrival.reason.id)
    })

    // And I should be redirected to the premises page
    const premisesPage = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    premisesPage.shouldShowBanner('Non-arrival logged')
  })

  it('show non-arrival errors when the API returns an error', () => {
    // Given I have a booking for a premises
    const premises = extendedPremisesSummaryFactory.build()
    const bookingId = 'some-uuid'

    cy.task('stubPremisesSummary', premises)

    // When I visit the arrivals page
    const page = NonarrivalCreatePage.visit(premises.id, bookingId)

    // And I miss a required field
    cy.task('stubNonArrivalErrors', {
      premisesId: premises.id,
      bookingId,
      params: ['date', 'reason'],
    })
    page.submitNonArrivalFormWithoutFields()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['date', 'reason'])
  })
})
