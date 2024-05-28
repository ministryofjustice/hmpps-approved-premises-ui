import {
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  premisesBookingFactory,
  premisesSummaryFactory,
} from '../../../server/testutils/factories'

import { PremisesListPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'
import { fullPersonFactory } from '../../../server/testutils/factories/person'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    // Given I am logged in as a future manager
    signIn(['future_manager'])
  })

  describe('list', () => {
    it('should list all premises', () => {
      const premises = premisesSummaryFactory.buildList(5)
      cy.task('stubAllPremises', premises)
      cy.task('stubApAreaReferenceData')

      // When I visit the premises page
      const page = PremisesListPage.visit({ v2: true })

      // Then I should see all of the premises listed
      page.shouldShowPremises(premises)
    })
  })

  it('should show a single premises', () => {
    // Given there is a premises in the database
    const bookingsArrivingToday = premisesBookingFactory
      .arrivingToday()
      .buildList(2)
      .map(booking => ({ ...booking, person: fullPersonFactory.build() }))
    const bookingsLeavingToday = premisesBookingFactory
      .departingToday()
      .buildList(2)
      .map(booking => ({ ...booking, person: fullPersonFactory.build() }))
    const bookingsArrivingSoon = premisesBookingFactory
      .arrivingSoon()
      .buildList(5)
      .map(booking => ({ ...booking, person: fullPersonFactory.build() }))
    const bookingsDepartingSoon = premisesBookingFactory
      .departingSoon()
      .buildList(5)
      .map(booking => ({ ...booking, person: fullPersonFactory.build() }))
    const bookings = [
      ...bookingsArrivingToday,
      ...bookingsLeavingToday,
      ...bookingsArrivingSoon,
      ...bookingsDepartingSoon,
    ]

    const overcapacityStartDate = dateCapacityFactory.build({
      date: new Date(2023, 0, 1).toISOString(),
      availableBeds: -1,
    })
    const overcapacityEndDate = dateCapacityFactory.build({
      date: new Date(2023, 1, 1).toISOString(),
      availableBeds: -1,
    })

    const premises = extendedPremisesSummaryFactory.build({
      dateCapacities: [overcapacityStartDate, overcapacityEndDate],
      bookings,
    })

    cy.task('stubPremisesSummary', premises)

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises, { v2: true })

    // Then I should see the premises details shown
    page.shouldShowPremisesDetail()

    // And I should see all the bookings for that premises listed
    page.shouldShowBookings(bookingsArrivingToday, bookingsLeavingToday, bookingsArrivingSoon, bookingsDepartingSoon)

    // And I should see all the current residents for that premises listed
    page.shouldShowCurrentResidents(bookingsDepartingSoon)

    // And I should see the overcapacity banner showing the dates that the AP is overcapacity
    page.shouldShowOvercapacityMessage(overcapacityStartDate.date, overcapacityEndDate.date)
  })
})
