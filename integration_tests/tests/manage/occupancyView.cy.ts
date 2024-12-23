import { addDays } from 'date-fns'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  staffMemberFactory,
} from '../../../server/testutils/factories'

import { OccupancyViewPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../../pages/page'

context('Premises occupancy', () => {
  describe('show', () => {
    const startDateObj = new Date()
    const endDateObj = new Date(startDateObj)
    endDateObj.setDate(endDateObj.getDate() + 84)

    const startDate = DateFormats.dateObjToIsoDate(startDateObj)
    const endDate = DateFormats.dateObjToIsoDate(endDateObj)
    const premisesCapacity = cas1PremiseCapacityFactory.build({ startDate, endDate })

    const premises = premisesCapacity.premise
    const placements = cas1SpaceBookingSummaryFactory.buildList(30)
    const keyworkers = staffMemberFactory.keyworker().buildList(5)

    beforeEach(() => {
      cy.task('reset')

      // Given there is a premises in the database
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers: keyworkers })

      // And it has a list of upcoming placements
      cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements, residency: 'upcoming' })
      cy.task('stubPremiseCapacity', { premisesId: premises.id, startDate, endDate, premiseCapacity: premisesCapacity })
    })

    describe('with premises view permission', () => {
      beforeEach(() => {
        // Given I am logged in as a future manager with premises_view permission
        signIn(['future_manager'], ['cas1_premises_view'])
      })

      it('should show the next 12 weeks if navigated from premises page', () => {
        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // And I click the action link view spaces
        page.clickAction('View spaces')
        // Then I should navigate to the occupancy view
        const occPage = Page.verifyOnPage(OccupancyViewPage, `View spaces in ${premises.name}`)
        occPage.shouldShowCalendarHeading(startDate, DateFormats.differenceInDays(endDateObj, startDateObj).number)
        occPage.shouldShowCalendar(premisesCapacity)
      })

      it('should allow the user to change the calendar duration', () => {
        const endDate26 = DateFormats.dateObjToIsoDate(addDays(startDateObj, 7 * 26))
        cy.task('stubPremiseCapacity', {
          premisesId: premises.id,
          startDate,
          endDate: endDate26,
          premiseCapacity: premisesCapacity,
        })
        // When I visit the occupancy view page
        const page = OccupancyViewPage.visit(premises)
        // Then I should be shown the default period
        page.shouldShowCalendarHeading(startDate, DateFormats.differenceInDays(endDateObj, startDateObj).number)
        // When I select a different duration
        page.getSelectInputByIdAndSelectAnEntry('durationDays', '26 weeks')
        // and click submit
        page.clickSubmit()
        // Then the duration should change
        page.shouldShowCalendarHeading(startDate, 26 * 7)
        // and the new duration should be selected
        page.shouldHaveSelectText('durationDays', '26 weeks')
      })

      it('should allow the user to change the start date', () => {
        const newStartDate = DateFormats.dateObjToIsoDate(addDays(startDateObj, 5))
        const newEndDate = DateFormats.dateObjToIsoDate(addDays(startDateObj, 5 + 12 * 7))

        cy.task('stubPremiseCapacity', {
          premisesId: premises.id,
          startDate: newStartDate,
          endDate: newEndDate,
          premiseCapacity: premisesCapacity,
        })
        // When I visit the occupancy view page
        const page = OccupancyViewPage.visit(premises)
        // Then I should be shown the default period
        page.shouldShowCalendarHeading(startDate, DateFormats.differenceInDays(endDateObj, startDateObj).number)
        // When I select a different start date
        page.clearAndCompleteDateInputs('startDate', newStartDate)
        // and click submit
        page.clickSubmit()
        // Then the start date should change
        page.shouldShowCalendarHeading(newStartDate, 12 * 7)
        // and the new duration should be selected
        page.shouldHaveSelectText('durationDays', '12 weeks')
        // and the start date should be populated
        page.dateInputsShouldContainDate('startDate', newStartDate)
      })

      it('should validate the start date', () => {
        const newStartDate = DateFormats.dateObjToIsoDate(addDays(startDateObj, 5))
        const newEndDate = DateFormats.dateObjToIsoDate(addDays(startDateObj, 5 + 12 * 7))
        const badStartDate = '2023-02-29'

        cy.task('stubPremiseCapacity', {
          premisesId: premises.id,
          startDate: newStartDate,
          endDate: newEndDate,
          premiseCapacity: premisesCapacity,
        })
        // When I visit the occupancy view page
        const page = OccupancyViewPage.visit(premises)
        // Then I should be shown the default period
        page.shouldShowCalendarHeading(startDate, DateFormats.differenceInDays(endDateObj, startDateObj).number)
        // When I select a bad start date and submit
        page.clearAndCompleteDateInputs('startDate', badStartDate)
        page.clickSubmit()
        // Then an error should be shown
        page.shouldShowErrorMessagesForFields(['startDate'], {
          startDate: 'Enter a valid date',
        })
        // And the bad date I entered should be populated
        page.dateInputsShouldContainDate('startDate', badStartDate)
        // And the calendar should be blank
        cy.get('.calendar').should('not.exist')
        // When I select a different start date and click submit
        page.clearAndCompleteDateInputs('startDate', newStartDate)
        page.clickSubmit()
        // Then the new start date should be shown
        page.shouldHaveSelectText('durationDays', '12 weeks')
        page.dateInputsShouldContainDate('startDate', newStartDate)
      })

      it('should not be available in the premises actions menu if the premises does not support space bookings', () => {
        // Given that I am looking at a premises that does not support space bookings
        const nonSpaceBookingPremises = cas1PremisesSummaryFactory.build({ supportsSpaceBookings: false })
        cy.task('stubSinglePremises', nonSpaceBookingPremises)
        // When I visit premises details page
        const page = PremisesShowPage.visit(nonSpaceBookingPremises)
        // Then the view spaces action should not be shown
        page.actionShouldNotExist('View spaces')
      })
    })
    describe('Without premises view permission', () => {
      it('should not be availble if the user lacks premises_view permission', () => {
        // Given I am logged in as a future manager without premises_view permission
        signIn(['future_manager'])
        // When I navigate to the view premises occupancy page
        // Then I should see an error
        OccupancyViewPage.visitUnauthorised(premises)
      })
    })
  })
})
