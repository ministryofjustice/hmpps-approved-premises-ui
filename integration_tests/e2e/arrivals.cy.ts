import premisesFactory from '../../server/testutils/factories/premises'
import arrivalFactory from '../../server/testutils/factories/arrival'
import nonArrivalFactory from '../../server/testutils/factories/nonArrival'

import ArrivalCreatePage from '../pages/arrivalCreate'
import PremisesShowPage from '../pages/premisesShow'

context('Arrivals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('creates an arrival', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.build()
    const bookingId = 'some-uuid'
    const arrival = arrivalFactory.build({
      dateTime: new Date(2022, 1, 11).toISOString(),
      expectedDeparture: new Date(2022, 11, 11).toISOString(),
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId, arrival })

    // When I mark the booking as having arrived
    const page = ArrivalCreatePage.visit(premises.id, bookingId)
    page.completeArrivalForm(arrival)

    // Then an arrival should be created in the API
    cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const { dateTime, expectedDeparture } = arrival

      expect(requestBody.notes).equal(arrival.notes)
      expect(requestBody.dateTime).equal(dateTime)
      expect(requestBody.expectedDeparture).equal(expectedDeparture)
    })

    // And I should be redirected to the premises page
    PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
  })

  it('creates a non-arrival', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.build()
    const bookingId = 'some-uuid'
    const nonArrival = nonArrivalFactory.build({
      date: new Date(2022, 1, 11).toISOString(),
      reason: 'recalled',
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubNonArrivalCreate', { premisesId: premises.id, bookingId, nonArrival })

    // When I mark the booking as having not arrived
    const page = ArrivalCreatePage.visit(premises.id, bookingId)
    page.completeNonArrivalForm(nonArrival)

    // Then a non-arrival should be created in the API
    cy.task('verifyNonArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.notes).equal(nonArrival.notes)
      expect(requestBody.date).equal(nonArrival.date)
      expect(requestBody.reason).equal(nonArrival.reason)
    })

    // And I should be redirected to the premises page
    PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
  })
})
