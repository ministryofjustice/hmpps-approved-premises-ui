import { addDays } from 'date-fns'
import { createOccupancyEntry } from '../../support/helpers'
import {
  bedDetailFactory,
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  premisesBookingFactory,
  premisesSummaryFactory,
} from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'

import { CalendarPage, PremisesListPage, PremisesShowPage } from '../../pages/manage'
import OverbookingPage from '../../pages/manage/overbooking'
import { signIn } from '../signIn'
import { fullPersonFactory } from '../../../server/testutils/factories/person'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  describe('list', () => {
    it('should list all premises', () => {
      // Given I am logged in as legacy manager
      signIn(['legacy_manager'])

      const premises = premisesSummaryFactory.buildList(5)
      cy.task('stubAllPremises', premises)
      cy.task('stubApAreaReferenceData')

      // When I visit the premises page
      const page = PremisesListPage.visit()

      // Then I should see all of the premises listed
      page.shouldShowPremises(premises)
    })
  })

  it('should show a single premises', () => {
    // Given I am logged in as legacy manager
    signIn(['legacy_manager'])

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
    // Given I am logged in as manager
    signIn(['manager'])

    // Given there is a premises in the database
    const premises = extendedPremisesSummaryFactory.build()

    cy.task('stubPremisesSummary', premises)

    // And that premises has bookings for a bed
    const startDate = new Date()
    const premisesOccupancy = [
      {
        bedId: '1',
        bedName: 'Bed 1',
        schedule: [
          createOccupancyEntry(startDate, addDays(startDate, 3), 'open'),
          createOccupancyEntry(addDays(startDate, 4), addDays(startDate, 9), 'booking'),
          createOccupancyEntry(addDays(startDate, 10), addDays(startDate, 19), 'lost_bed'),
          createOccupancyEntry(addDays(startDate, 20), addDays(startDate, 35), 'booking'),
        ],
      },
      {
        bedId: '2',
        bedName: 'Bed 2',
        schedule: [
          createOccupancyEntry(startDate, addDays(startDate, 7), 'open'),
          createOccupancyEntry(addDays(startDate, 8), addDays(startDate, 30), 'booking'),
        ],
      },
      {
        bedId: '3',
        bedName: 'Bed 3',
        schedule: [createOccupancyEntry(startDate, addDays(startDate, 50), 'open')],
      },
      {
        bedId: '4',
        bedName: 'Bed 4',
        schedule: [
          createOccupancyEntry(startDate, addDays(startDate, 21), 'lost_bed'),
          createOccupancyEntry(addDays(startDate, 22), addDays(startDate, 35), 'booking'),
        ],
      },
    ]

    cy.task('stubPremisesOccupancy', {
      premisesId: premises.id,
      startDate: DateFormats.dateObjToIsoDate(startDate),
      endDate: DateFormats.dateObjToIsoDate(addDays(startDate, 30)),
      premisesOccupancy,
    })

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should be able to click to view the calendar
    page.clickViewCalendar()

    // And the calendar should show the schedule
    const calendar = new CalendarPage(premises)
    calendar.shouldShowOccupancy(premisesOccupancy)
  })

  it('should show overbookings', () => {
    // Given I am logged in as manager
    signIn(['manager'])

    // Given there is a premises in the database
    const premises = extendedPremisesSummaryFactory.build()
    const bedDetail = bedDetailFactory.build()

    cy.task('stubPremisesSummary', premises)

    // And that premises has bookings with overbookings for a bed
    const startDate = new Date()

    const firstEntry = createOccupancyEntry(startDate, addDays(startDate, 12), 'booking')
    const secondEntry = createOccupancyEntry(addDays(startDate, 4), addDays(startDate, 15), 'booking')
    const thirdEntry = createOccupancyEntry(addDays(startDate, 16), addDays(startDate, 25), 'lost_bed')
    const fourthEntry = createOccupancyEntry(addDays(startDate, 21), addDays(startDate, 40), 'booking')

    const premisesOccupancy = [
      {
        bedId: bedDetail.id,
        bedName: 'Bed 1',
        schedule: [firstEntry, secondEntry, thirdEntry, fourthEntry],
      },
    ]

    cy.task('stubPremisesOccupancy', {
      premisesId: premises.id,
      startDate: DateFormats.dateObjToIsoDate(startDate),
      endDate: DateFormats.dateObjToIsoDate(addDays(startDate, 30)),
      premisesOccupancy,
    })

    cy.task('stubBed', { premisesId: premises.id, bedDetail })

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should be able to click to view the calendar
    page.clickViewCalendar()

    // And the calendar should show the schedule
    const calendar = new CalendarPage(premises)
    // And the overbookings should be shown for the relevant dates
    calendar.shouldShowOverbookingsForPeriod(secondEntry.startDate, firstEntry.endDate)
    calendar.shouldShowOverbookingsForPeriod(fourthEntry.startDate, thirdEntry.endDate)

    // And the overbooked bookings should be partially visible
    calendar.shouldShowOccupancyForId(firstEntry.bookingId, DateFormats.isoToDateObj(firstEntry.startDate), '4')
    calendar.shouldShowOccupancyForId(
      secondEntry.bookingId,
      addDays(DateFormats.isoToDateObj(firstEntry.endDate), 1),
      '3',
    )
    calendar.shouldShowOccupancyForId(thirdEntry.lostBedId, DateFormats.isoToDateObj(thirdEntry.startDate), '5')
    calendar.shouldShowOccupancyForId(
      fourthEntry.bookingId,
      addDays(DateFormats.isoToDateObj(thirdEntry.endDate), 1),
      '5',
    )

    // When I click on the first overbooking
    calendar.clickOverbookingLink(0)

    // Then I should see details of the first overbooking
    const overbookingPage = new OverbookingPage()

    overbookingPage.shouldShowDetailOfBooking(firstEntry)
    overbookingPage.shouldShowDetailOfBooking(secondEntry)

    // When I click back
    overbookingPage.clickBack()

    // And I click on the second overbooking
    calendar.clickOverbookingLink(1)

    // Then I should see details of the first overbooking
    overbookingPage.shouldShowDetailOfLostBed(thirdEntry)
    overbookingPage.shouldShowDetailOfBooking(fourthEntry)
  })
})
