import {
  Cas1PremiseCapacity,
  Cas1PremisesSummary,
  Cas1SpaceSearchParameters,
  PlacementCriteria,
} from '@approved-premises/api'
import { addDays } from 'date-fns'
import SearchPage from '../../pages/match/searchPage'
import UnableToMatchPage from '../../pages/match/unableToMatchPage'

import {
  cas1PremiseCapacityFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingFactory,
  personFactory,
  placementRequestDetailFactory,
  spaceBookingRequirementsFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultsFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { signIn } from '../signIn'

import ListPage from '../../pages/admin/placementApplications/listPage'
import { filterOutAPTypes, placementDates } from '../../../server/utils/match'
import BookASpacePage from '../../pages/match/bookASpacePage'
import OccupancyViewPage from '../../pages/match/occupancyViewPage'
import applicationFactory from '../../../server/testutils/factories/application'
import DayAvailabilityPage from '../../pages/match/dayAvailabilityPage'

context('Placement Requests', () => {
  beforeEach(() => {
    process.env.ENABLE_V2_MATCH = 'true'

    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubCruManagementAreaReferenceData')
  })
  const defaultLicenceExpiryDate = '2030-06-05'

  it('allows me to search for an available space', () => {
    // Given I am signed in as a cru_member
    signIn(['cru_member'], ['cas1_space_booking_create'])

    // And there is a placement request waiting for me to match
    const person = personFactory.build()
    const placementRequest = placementRequestDetailFactory.build({ person })
    const spaceSearchResults = spaceSearchResultsFactory.build()

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubPlacementRequest', placementRequest)

    // When I visit the search page
    const searchPage = SearchPage.visit(placementRequest)

    // Then I should see the details of the case I am matching
    searchPage.shouldShowCaseDetails(placementRequest)

    // And I should see the search results
    let numberOfSearches = 0
    searchPage.shouldDisplaySearchResults(spaceSearchResults, placementRequest.location)
    numberOfSearches += 1

    // Given I want to search for a different space
    // When I enter new details on the search screen
    const newSearchParameters = spaceSearchParametersUiFactory.build()
    searchPage.changeSearchParameters(newSearchParameters)
    searchPage.clickSubmit()
    numberOfSearches += 1

    // Then I should see the search results
    Page.verifyOnPage(SearchPage)

    // And the new search criteria should be selected
    searchPage.shouldShowSearchParametersInInputs(newSearchParameters)

    // And the results should have links with the correct AP type and criteria
    searchPage.shouldHaveSearchParametersInLinks(newSearchParameters)

    // And the parameters should be submitted to the API
    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)
      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody: Cas1SpaceSearchParameters = JSON.parse(requests[1].body)

      const filteredPlacementCriteria = filterOutAPTypes([
        ...placementRequest.desirableCriteria,
        ...placementRequest.essentialCriteria,
      ])

      // And the first request to the API should contain the criteria from the placement request
      expect(initialSearchRequestBody).to.deep.equal({
        applicationId: placementRequest.applicationId,
        durationInDays: placementRequest.duration,
        startDate: placementRequest.expectedArrival,
        targetPostcodeDistrict: placementRequest.location,
        requirements: {
          apTypes: [placementRequest.type],
          genders: [placementRequest.gender],
          spaceCharacteristics: filteredPlacementCriteria,
        },
      })

      // And the second request to the API should contain the new criteria I submitted
      expect(secondSearchRequestBody).to.contain({
        applicationId: placementRequest.applicationId,
        durationInDays: placementRequest.duration,
        startDate: newSearchParameters.startDate,
        targetPostcodeDistrict: newSearchParameters.targetPostcodeDistrict,
      })

      expect(secondSearchRequestBody.requirements.apTypes).to.contain.members([newSearchParameters.requirements.apType])
      expect(secondSearchRequestBody.requirements.spaceCharacteristics).to.contain.members(
        newSearchParameters.requirements.spaceCharacteristics,
      )
      expect(secondSearchRequestBody.requirements.genders).to.contain.members([newSearchParameters.requirements.gender])
    })
  })

  it('allows me to view spaces and occupancy capacity', () => {
    const { occupancyViewPage, premiseCapacity } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // And I should see a summary of occupancy
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity)

    // And I should see an occupancy calendar
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity)
  })

  it('allows me to view spaces and occupancy capacity with blank licence expiry date', () => {
    const { occupancyViewPage, premiseCapacity } = shouldVisitOccupancyViewPageAndShowMatchingDetails(undefined)

    // And I should see a summary of occupancy
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity)

    // And I should see an occupancy calendar
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity)
  })

  it('allows me to submit invalid dates in the book your placement form on occupancy view page and displays appropriate validation messages', () => {
    const { occupancyViewPage } = shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // When I submit invalid dates
    occupancyViewPage.shouldFillBookYourPlacementFormDates('2024-11-25', '2024-11-24')
    occupancyViewPage.clickContinue()

    // Then I should see validation messages
    occupancyViewPage.shouldShowErrorSummaryAndErrorMessage('The departure date must be after the arrival date')
  })

  it('allows me to submit valid dates in the book your placement form on occupancy view page and redirects to book a space', () => {
    const { occupancyViewPage, placementRequest, premises } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // When I submit valid dates
    const arrivalDate = '2024-11-25'
    occupancyViewPage.shouldFillBookYourPlacementFormDates(arrivalDate, '2024-11-26')
    occupancyViewPage.clickContinue()

    // Then I should land on the Book a space page (with the new dates overriding the original ones)
    const bookASpacePage = Page.verifyOnPage(BookASpacePage, premises.name)
    bookASpacePage.shouldShowBookingDetails(placementRequest, arrivalDate, 1, 'normal')
  })

  const shouldVisitOccupancyViewPageAndShowMatchingDetails = (licenceExpiryDate: string | undefined) => {
    const apType = 'normal'
    const durationDays = 15
    const startDate = '2024-07-23'
    const endDate = '2024-08-07'
    const totalCapacity = 10
    const managerDetails = 'John Doe'

    // Given I am signed in as a cru_member
    signIn(['cru_member'], ['cas1_space_booking_create'])

    // And there is a placement request waiting for me to match
    const person = personFactory.build()
    const premises = cas1PremisesSummaryFactory.build({ bedCount: totalCapacity })
    const placementRequest = placementRequestDetailFactory.build({
      person,
      expectedArrival: startDate,
      duration: durationDays,
      application: applicationFactory.build({
        licenceExpiryDate,
      }),
    })
    const premiseCapacity = cas1PremiseCapacityFactory.build({
      premise: { id: premises.id, bedCount: totalCapacity, managerDetails },
      startDate,
      endDate,
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubPremiseCapacity', { premisesId: premises.id, startDate, endDate, premiseCapacity })

    // When I visit the occupancy view page
    const occupancyViewPage = OccupancyViewPage.visit(placementRequest, premises, apType)

    // Then I should see the details of the case I am matching
    occupancyViewPage.shouldShowMatchingDetails(
      totalCapacity,
      startDate,
      durationDays,
      placementRequest,
      managerDetails,
    )
    return { occupancyViewPage, placementRequest, premiseCapacity, premises, startDate }
  }

  const shouldShowDayDetailsAndReturn = (
    occupancyViewPage: OccupancyViewPage,
    date: Date,
    premises: Cas1PremisesSummary,
    premiseCapacity: Cas1PremiseCapacity,
  ) => {
    const dayCapacity = occupancyViewPage.getOccupancyForDate(date, premiseCapacity)
    const premiseCapacityForDay = cas1PremiseCapacityFactory.build({
      premise: premiseCapacity.premise,
      startDate: dayCapacity.date,
      endDate: dayCapacity.date,
      capacity: [dayCapacity],
    })
    cy.task('stubPremiseCapacity', {
      premisesId: premises.id,
      startDate: dayCapacity.date,
      endDate: dayCapacity.date,
      premiseCapacity: premiseCapacityForDay,
    })

    // When I click on a day on the calendar
    occupancyViewPage.clickCalendarDay(dayCapacity.date)

    // Then I should see the page showing details for the day
    const dayAvailabilityPage = new DayAvailabilityPage(dayCapacity)

    // And I should see availability details
    dayAvailabilityPage.shouldShowDayAvailability()

    // When I click back
    dayAvailabilityPage.clickBack()
  }

  it('allows me to view spaces and occupancy capacity and filter the result', () => {
    const { occupancyViewPage, premiseCapacity, premises, startDate } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // And I should see the filter form with populated values
    occupancyViewPage.shouldShowFilters(startDate, 'Up to 6 weeks', [])

    // And I should see a summary of occupancy
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity)

    // And I should see an occupancy calendar
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity)

    // Then I should see the calendar again
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity)

    // And I should be able to see the day's availability details
    shouldShowDayDetailsAndReturn(occupancyViewPage, addDays(startDate, 10), premises, premiseCapacity)

    // When I filter with an invalid date
    occupancyViewPage.filterAvailability('2025-02-35')

    // Then I should see an error message
    occupancyViewPage.shouldShowErrorMessagesForFields(['startDate'], {
      startDate: 'Enter a valid date',
    })

    // When I filter for a different date and duration
    const newStartDate = '2024-08-01'
    const newEndDate = '2024-08-08'
    const newDuration = 'Up to 1 week'
    const newCriteria = ['Wheelchair accessible', 'Step-free']
    const newPremiseCapacity = cas1PremiseCapacityFactory.build({
      premise: { id: premises.id, bedCount: premises.bedCount },
      startDate: newStartDate,
      endDate: newEndDate,
    })
    cy.task('stubPremiseCapacity', {
      premisesId: premises.id,
      startDate: newStartDate,
      endDate: newEndDate,
      premiseCapacity: newPremiseCapacity,
    })
    occupancyViewPage.filterAvailability(newStartDate, newDuration, newCriteria)

    // Then I should see the filter form with updated values
    occupancyViewPage.shouldShowFilters(newStartDate, newDuration, newCriteria)
  })

  it('allows me to book a space', () => {
    // Given I am signed in as a cru_member
    signIn(['cru_member'], ['cas1_space_booking_create'])

    const premisesName = 'Hope House'
    const premisesId = 'abc123'
    const apType = 'normal'
    const durationDays = 15
    const startDate = '2024-07-23'
    const { endDate } = placementDates(startDate, durationDays.toString())

    // And there is a placement request waiting for me to match
    const person = personFactory.build()
    const essentialCharacteristics: Array<PlacementCriteria> = ['acceptsHateCrimeOffenders']
    const desirableCharacteristics: Array<PlacementCriteria> = ['isCatered', 'hasEnSuite']
    const placementRequest = placementRequestDetailFactory.build({
      person,
      status: 'notMatched',
      duration: durationDays,
      essentialCriteria: essentialCharacteristics,
      desirableCriteria: desirableCharacteristics,
    })

    // When I visit the 'Book a space' page
    cy.task('stubPlacementRequest', placementRequest)
    const page = BookASpacePage.visit(placementRequest, startDate, durationDays, premisesName, premisesId, apType)

    // Then I should see the details of the space I am booking
    page.shouldShowBookingDetails(placementRequest, startDate, durationDays, apType)

    // And when I complete the form
    const requirements = spaceBookingRequirementsFactory.build()
    const spaceBooking = cas1SpaceBookingFactory.build({ requirements })
    cy.task('stubSpaceBookingCreate', { placementRequestId: placementRequest.id, spaceBooking })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequest], status: 'matched' })
    page.clickSubmit()

    // Then I should be redirected to the 'Matched' tab
    const cruDashboard = Page.verifyOnPage(ListPage)

    // And I should see a success message
    cruDashboard.shouldShowSpaceBookingConfirmation(premisesName, person.name)

    // And the booking details should have been sent to the API
    cy.task('verifySpaceBookingCreate', placementRequest).then(requests => {
      expect(requests).to.have.length(1)
      const body = JSON.parse(requests[0].body)

      expect(body).to.deep.equal({
        arrivalDate: startDate,
        departureDate: endDate,
        premisesId,
        requirements: {
          ...spaceBooking.requirements,
          essentialCharacteristics: placementRequest.essentialCriteria,
        },
      })
    })
  })

  it('allows me to mark a placement request as unable to match', () => {
    signIn(['cru_member'], ['cas1_space_booking_create'])

    // Given there is a placement request waiting for me to match
    const placementRequest = placementRequestDetailFactory.build({
      status: 'notMatched',
      person: personFactory.build(),
    })

    const spaceSearchResults = spaceSearchResultsFactory.build()

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubUnableToMatchPlacementRequest', placementRequest)
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequest], status: 'notMatched' })

    // When I visit the search
    const searchPage = SearchPage.visit(placementRequest)
    // And I declare that I do not see a suitable space
    searchPage.clickUnableToMatch()

    // Then I am able to complete a form to explain why the spaces weren't suitable
    const unableToMatchPage = new UnableToMatchPage()

    // When I complete the form
    unableToMatchPage.completeForm()
    unableToMatchPage.clickSubmit()

    // Then I should see a success message on the list page
    Page.verifyOnPage(ListPage)
  })
})
