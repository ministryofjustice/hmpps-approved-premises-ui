import {
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  premisesBookingFactory,
  premisesFactory,
  premisesSummaryFactory,
} from '../../../server/testutils/factories'

import DashboardPage from '../../pages/dashboard'
import { PremisesShowPage, V2PremisesListPage } from '../../pages/manage'

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
      const v2PremisesListPage = V2PremisesListPage.visit()

      // Then I should see all of the premises listed
      v2PremisesListPage.shouldShowPremises(premises)
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

    const premisesId = '123'
    const premisesName = 'Hope House'
    const premises = extendedPremisesSummaryFactory.build({
      dateCapacities: [overcapacityStartDate, overcapacityEndDate],
      bookings,
      id: premisesId,
    })

    const allPremises = [premisesSummaryFactory.build({ name: premisesName, id: premisesId })]
    cy.task('stubAllPremises', allPremises)
    cy.task('stubApAreaReferenceData')

    const fullPremises = premisesFactory.build({ id: premisesId, name: premisesName })

    cy.task('stubPremisesSummary', premises)
    cy.task('stubSinglePremises', fullPremises)

    // Given I'm on the dashboard
    const dashboard = DashboardPage.visit()

    // When I navigate to the v2 premises list
    dashboard.followLinkTo('Manage an Approved Premises')
    const premisesListPage = new V2PremisesListPage()

    // And I navigate to the particular v2 premises page
    premisesListPage.followLinkToPremisesNamed(premisesName)
    const page = new PremisesShowPage(premises)

    // Then I should see the premises details shown
    page.shouldShowAPArea(fullPremises.apArea.name)
    page.shouldShowPremisesDetail()

    // And I should NOT see all the bookings for that premises listed
    page.shouldNotShowBookings()

    // And I should NOT see all the current residents for that premises listed
    page.shouldNotShowCurrentResidents()

    // And I should see the overcapacity banner showing the dates that the AP is overcapacity
    page.shouldShowOvercapacityMessage(overcapacityStartDate.date, overcapacityEndDate.date)
  })
})
