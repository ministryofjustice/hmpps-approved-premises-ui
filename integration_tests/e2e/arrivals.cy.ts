import premisesFactory from '../../server/testutils/factories/premises'
import arrivalFactory from '../../server/testutils/factories/arrival'

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
    const arrival = arrivalFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId, arrival })

    // When I mark the booking as having arrived
    const page = ArrivalCreatePage.visit(premises.id, bookingId)
    page.completeForm(arrival)

    // Then an arrival should be created in the API
    cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const dateTime = arrival.dateTime as Date
      const expectedDeparture = arrival.expectedDeparture as Date

      const expectedDateTime = new Date(
        Date.UTC(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate(), 0, 0, 0),
      )
      const expectedExpectedDeparture = new Date(
        Date.UTC(expectedDeparture.getFullYear(), expectedDeparture.getMonth(), expectedDeparture.getDate(), 0, 0, 0),
      )

      expect(requestBody.notes).equal(arrival.notes)
      expect(requestBody.dateTime).equal(expectedDateTime.toISOString())
      expect(requestBody.expectedDeparture).equal(expectedExpectedDeparture.toISOString())
    })

    // And I should be redirected to the premises page
    PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
  })
})
