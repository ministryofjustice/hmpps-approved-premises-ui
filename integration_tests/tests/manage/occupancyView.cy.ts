import { addDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { Cas1PremiseCapacityForDay, Cas1PremisesDaySummary } from '@approved-premises/api'
import {
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingSummaryFactory,
  staffMemberFactory,
} from '../../../server/testutils/factories'

import { OccupancyViewPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../../pages/page'
import { premiseCharacteristicAvailability } from '../../../server/testutils/factories/cas1PremiseCapacity'
import OccupancyDayViewPage from '../../pages/manage/occupancyDayView'

context('Premises occupancy', () => {
  const startDate = DateFormats.dateObjToIsoDate(new Date())
  const endDate = DateFormats.dateObjToIsoDate(addDays(startDate, 84))
  const premises = cas1PremisesFactory.build()
  const premisesCapacity = cas1PremiseCapacityFactory.build({ startDate, endDate })

  const placements = cas1SpaceBookingSummaryFactory.buildList(30)
  const keyworkers = staffMemberFactory.keyworker().buildList(5)

  beforeEach(() => {
    cy.task('reset')

    // Given there is a premises in the database
    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers: keyworkers })

    // And it has a list of upcoming placements
    cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements, residency: 'upcoming' })
    cy.task('stubSpaceBookingSummaryList', {
      premisesId: premises.id,
      placements,
      residency: 'current',
      sortBy: 'personName',
      perPage: 2000,
    })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      startDate,
      endDate: DateFormats.dateObjToIsoDate(addDays(endDate, -1)),
      premiseCapacity: premisesCapacity,
    })
  })

  describe('with premises view permission', () => {
    beforeEach(() => {
      // Given I am signed in as a future manager
      signIn('future_manager')
    })

    it('should show the next 12 weeks if navigated from premises page', () => {
      // When I visit premises details page
      const page = PremisesShowPage.visit(premises)

      // And I click the action link view spaces
      page.clickAction('View spaces')
      // Then I should navigate to the occupancy view
      const occPage = Page.verifyOnPage(OccupancyViewPage, `View spaces in ${premises.name}`)

      // and the start date should be today's date
      occPage.datePickerShouldContainDate('startDate', startDate)

      // and the duration should show '12 weeks'
      occPage.shouldHaveSelectText('durationDays', '12 weeks')

      // and the calendar should be shown
      occPage.shouldShowCalendarHeading(startDate, DateFormats.durationBetweenDates(endDate, startDate).number)
      occPage.shouldShowCalendar({
        premisesCapacity,
        colourMode: 'threeColour',
        logic: 'manage',
      })
    })

    it('should allow the user to change the start date and the calendar duration', () => {
      const newStartDate = DateFormats.dateObjToIsoDate(addDays(startDate, 5))
      const newEndDate = DateFormats.dateObjToIsoDate(addDays(startDate, 5 + 26 * 7))

      cy.task('stubPremisesCapacity', {
        premisesId: premises.id,
        startDate: newStartDate,
        endDate: DateFormats.dateObjToIsoDate(addDays(newEndDate, -1)),
        premiseCapacity: premisesCapacity,
      })

      // When I visit the occupancy view page
      const page = OccupancyViewPage.visit(premises)

      // Then I should be shown the default period
      page.shouldShowCalendarHeading(startDate, DateFormats.durationBetweenDates(endDate, startDate).number)

      // When I enter a different start date
      page.clearAndCompleteDatePicker('startDate', newStartDate)

      // And I select a different duration
      page.getSelectInputByIdAndSelectAnEntry('durationDays', '26 weeks')

      // and click submit
      page.clickApplyFilter()

      // Then the start date should be populated
      page.datePickerShouldContainDate('startDate', newStartDate)

      // and the new duration should be selected
      page.shouldHaveSelectText('durationDays', '26 weeks')

      // and the calendar heading should show the new start date and duration
      page.shouldShowCalendarHeading(newStartDate, 26 * 7)
    })

    it('should validate the start date', () => {
      const newStartDate = DateFormats.dateObjToIsoDate(addDays(startDate, 5))
      const newEndDate = DateFormats.dateObjToIsoDate(addDays(startDate, 5 + 12 * 7))
      const badStartDate = '2023-02-29'

      cy.task('stubPremisesCapacity', {
        premisesId: premises.id,
        startDate: newStartDate,
        endDate: DateFormats.dateObjToIsoDate(addDays(newEndDate, -1)),
        premiseCapacity: premisesCapacity,
      })
      // When I visit the occupancy view page
      const page = OccupancyViewPage.visit(premises)
      // Then I should be shown the default period
      page.shouldShowCalendarHeading(startDate, DateFormats.durationBetweenDates(endDate, startDate).number)
      // When I select a bad start date and submit
      page.clearAndCompleteDatePicker('startDate', badStartDate)
      page.clickApplyFilter()
      // Then an error should be shown
      page.shouldShowErrorMessagesForFields(['startDate'], {
        startDate: 'Enter a valid date',
      })
      // And the bad date I entered should be populated
      page.datePickerShouldContainDate('startDate', badStartDate)
      // And the calendar should be blank
      cy.get('.calendar').should('not.exist')
      // When I select a different start date and click submit
      page.clearAndCompleteDatePicker('startDate', newStartDate)
      page.clickApplyFilter()
      // Then the new start date should be shown
      page.shouldHaveSelectText('durationDays', '12 weeks')
      page.datePickerShouldContainDate('startDate', newStartDate)
    })

    it('should not be available in the premises actions menu if the premises does not support space bookings', () => {
      // Given that I am looking at a premises that does not support space bookings
      const nonSpaceBookingPremises = cas1PremisesFactory.build({ supportsSpaceBookings: false })
      cy.task('stubSinglePremises', nonSpaceBookingPremises)
      // When I visit premises details page
      const page = PremisesShowPage.visit(nonSpaceBookingPremises)
      // Then the view spaces action should not be shown
      page.actionShouldNotExist('View spaces')
    })
  })
  describe('Without premises view permission', () => {
    it('should not be available if the user lacks premises_view permission', () => {
      // Given I am signed in as an applicant
      signIn('applicant')
      // When I navigate to the view premises occupancy page
      // Then I should see an error
      OccupancyViewPage.visitUnauthorised(premises)
    })
  })
})

context('Premises day occupancy', () => {
  const dateObj = faker.date.soon({ days: 20 })
  const date = DateFormats.dateObjToIsoDate(dateObj)
  const nextDate = DateFormats.dateObjToIsoDate(addDays(dateObj, 1))
  const premises = cas1PremisesBasicSummaryFactory.build()

  const stubDaySummary = (
    forDate: string,
    overBook = false,
  ): { premisesDaySummary: Cas1PremisesDaySummary; capacity: Cas1PremiseCapacityForDay } => {
    const characteristicAvailability = overBook
      ? [
          premiseCharacteristicAvailability.overbooked().build({ characteristic: 'isSingle' }),
          premiseCharacteristicAvailability.overbooked().build({ characteristic: 'hasEnSuite' }),
        ]
      : [
          premiseCharacteristicAvailability.available().build({ characteristic: 'isSingle' }),
          premiseCharacteristicAvailability.available().build({ characteristic: 'hasEnSuite' }),
        ]

    const capacity = cas1PremiseCapacityForDayFactory.available().build({
      characteristicAvailability,
    })
    const premiseCapacity = cas1PremiseCapacityFactory.build({
      capacity: [capacity],
      startDate: forDate,
      endDate: forDate,
    })
    const premisesDaySummary = cas1PremisesDaySummaryFactory.build({ forDate })
    cy.task('stubPremisesDaySummary', { premisesId: premises.id, date: forDate, premisesDaySummary })
    cy.task('stubPremisesCapacity', { premisesId: premises.id, startDate: forDate, endDate: forDate, premiseCapacity })
    return { premisesDaySummary, capacity }
  }

  beforeEach(() => {
    cy.task('reset')
    // Given there is a premises in the database
    cy.task('stubSinglePremises', premises)
  })

  describe('with premises view permission', () => {
    beforeEach(() => {
      // Given I am signed in as a future manager
      signIn('future_manager')
    })

    it('should show the day summary if spaces available', () => {
      const { premisesDaySummary, capacity } = stubDaySummary(date)
      // When I visit premises day summary page for a day with no characteristic overbooking
      const summaryPage = OccupancyDayViewPage.visit(premises, date)
      // I should see the occupancy summary for the day
      summaryPage.shouldShowDaySummaryDetails(capacity)
      // And I should not see a warning banner
      summaryPage.shouldNotShowBanner()
      // And I should see a list of placements
      summaryPage.shouldShowListOfPlacements(premisesDaySummary.spaceBookingSummaries)
      // And I should see a list of out-of-service bed records
      summaryPage.shouldShowListOfOutOfServiceBeds(premisesDaySummary.outOfServiceBeds)
    })

    it('should show the day summary and warning if overbooked', () => {
      const { capacity } = stubDaySummary(date, true)
      // When I visit premises day summary page for a day with a characteristic overbooking
      const summaryPage = OccupancyDayViewPage.visit(premises, date)
      // I should see the occupancy summary for the day
      summaryPage.shouldShowDaySummaryDetails(capacity)
      // And I should see a warning banner
      summaryPage.shouldShowBanner('This AP is overbooked on: single room and en-suite.')
    })

    it('should allow navigation to the next day and back again', () => {
      stubDaySummary(date)
      stubDaySummary(nextDate)
      // Given I visit premises day summary page
      const summaryPage = OccupancyDayViewPage.visit(premises, date)
      // When I click on Next day, Then I navigate to the next day
      summaryPage.shouldNavigateToDay('Next day', nextDate)
      // When I click on Previous day, Then I navigate back to the date I started on
      summaryPage.shouldNavigateToDay('Previous day', date)
    })

    it('should allow the placement table to be sorted', () => {
      stubDaySummary(date)
      stubDaySummary(nextDate)
      // Given I visit premises day summary page
      const page = OccupancyDayViewPage.visit(premises, date)
      // When I click a sort column in the placement table
      page.clickSortBy('canonicalArrivalDate')
      // Then the column should be sorted
      page.shouldBeSortedByField('canonicalArrivalDate', 'ascending')
      // When I click the same column again
      page.clickSortBy('canonicalArrivalDate')
      // Then the sort direction should be reversed
      page.shouldBeSortedByField('canonicalArrivalDate', 'descending')
      // And the correct sort parameters should have been used
      cy.task('verifyPremisesDaySummaryRequest', { premisesId: premises.id, date }).then(result => {
        expect(result[0].url).match(/bookingsSortDirection=asc&bookingsSortBy=personName/)
        expect(result[1].url).match(/bookingsSortDirection=asc&bookingsSortBy=canonicalArrivalDate/)
        expect(result[2].url).match(/bookingsSortDirection=desc&bookingsSortBy=canonicalArrivalDate/)
      })
      // When I navigate to the next day
      page.shouldNavigateToDay('Next day', nextDate)
      // Then the last sort order should be retained
      page.shouldBeSortedByField('canonicalArrivalDate', 'descending')
    })

    it('should allow the placement table to be filtered', () => {
      stubDaySummary(date)
      stubDaySummary(nextDate)
      // Given I visit premises day summary page
      const page = OccupancyDayViewPage.visit(premises, date)
      // And the single room filter is not selected
      page.shouldNotBeSelected('isSingle')
      // When I click a filter checkbox and submit
      page.checkCheckboxByValue('isSingle')
      page.clickSubmit()
      // Then the results should be filtered
      page.shouldBeSelected('isSingle')
      // And the correct filter parameter should have been used
      cy.task('verifyPremisesDaySummaryRequest', { premisesId: premises.id, date }).then(result => {
        expect(result[1].url).match(/&bookingsCriteriaFilter=isSingle/)
      })
      // When I navigate to the next day
      page.shouldNavigateToDay('Next day', nextDate)
      // Then the results should still be filtered
      page.shouldBeSelected('isSingle')
    })
  })

  describe('Without premises view permission', () => {
    it('should not be available if the user lacks premises_view permission', () => {
      // Given I am signed in as an applicant
      signIn('applicant')
      // When I navigate to the view premises occupancy page
      // Then I should see an error
      OccupancyDayViewPage.visitUnauthorised(premises, date)
    })
  })
})
