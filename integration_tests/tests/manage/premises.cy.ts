import { addDays } from 'date-fns'
import {
  bedOccupancyRangeFactory,
  bookingFactory,
  dateCapacityFactory,
  premisesFactory,
} from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'

import { PremisesListPage, PremisesShowPage } from '../../pages/manage'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should list all premises', () => {
    // Given there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Then I should see all of the premises listed
    page.shouldShowPremises(premises)
  })

  it('should show a single premises', () => {
    // Given there is a premises in the database
    const premises = premisesFactory.build()
    const bookingsArrivingToday = bookingFactory.arrivingToday().buildList(2)
    const bookingsLeavingToday = bookingFactory.departingToday().buildList(2)
    const bookingsArrivingSoon = bookingFactory.arrivingSoon().buildList(5)
    const bookingsDepartingSoon = bookingFactory.departingSoon().buildList(5)
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

    cy.task('stubPremisesWithBookings', { premises, bookings })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: [overcapacityStartDate, overcapacityEndDate],
    })

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should see the premises details shown
    page.shouldShowPremisesDetail()

    // And I should see all the bookings for that premises listed
    page.shouldShowBookings(bookingsArrivingToday, bookingsLeavingToday, bookingsArrivingSoon, bookingsDepartingSoon)

    // And I should see all the current residents for that premises listed
    page.shouldShowCurrentResidents(bookingsDepartingSoon)

    // And I should see the overcapacity banner showing the dates that the AP is overcapacity
    page.shouldShowOvercapacityMessage(overcapacityStartDate.date, overcapacityEndDate.date)
  })

  it('should show the premises calendar', () => {
    // Given there is a premises in the database
    const premises = premisesFactory.build()

    const premisesOccupancy = bedOccupancyRangeFactory.buildList(10)
    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: [],
    })
    cy.task('stubPremisesOccupancy', {
      premisesId: premises.id,
      startDate: DateFormats.dateObjToIsoDate(new Date()),
      endDate: DateFormats.dateObjToIsoDate(addDays(new Date(), 30)),
      premisesOccupancy,
    })

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should be able to click to view the calendar
    page.clickViewCalendar()
  })
})
