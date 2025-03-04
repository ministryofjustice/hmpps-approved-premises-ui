import {
  Cas1PremiseCapacity,
  Cas1Premises,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceSearchParameters,
  FullPerson,
} from '@approved-premises/api'
import SearchPage from '../../pages/match/searchPage'
import UnableToMatchPage from '../../pages/match/unableToMatchPage'

import {
  cas1PremiseCapacityFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  personFactory,
  placementRequestDetailFactory,
  spaceSearchResultFactory,
  spaceSearchResultsFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { signIn } from '../signIn'

import ListPage from '../../pages/admin/placementApplications/listPage'
import BookASpacePage from '../../pages/match/bookASpacePage'
import OccupancyViewPage from '../../pages/match/occupancyViewPage'
import applicationFactory from '../../../server/testutils/factories/application'
import DayAvailabilityPage from '../../pages/match/dayAvailabilityPage'
import apiPaths from '../../../server/paths/api'
import spaceSearchState from '../../../server/testutils/factories/spaceSearchState'
import {
  filterApLevelCriteria,
  filterRoomLevelCriteria,
  initialiseSearchState,
} from '../../../server/utils/match/spaceSearch'
import { applyApTypeToAssessApType } from '../../../server/utils/placementCriteriaUtils'
import premisesSearchResultSummary from '../../../server/testutils/factories/cas1PremisesSearchResultSummary'
import { DateFormats } from '../../../server/utils/dateUtils'
import { placementDates } from '../../../server/utils/match'
import { roomCharacteristicMap } from '../../../server/utils/characteristicsUtils'

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
    const newSearchState = spaceSearchState.build()
    searchPage.changeSearchParameters(newSearchState)
    searchPage.clickSubmit()
    numberOfSearches += 1

    // Then I should see the search results
    Page.verifyOnPage(SearchPage)

    // And the new search criteria should be selected
    searchPage.shouldShowSearchParametersInInputs(newSearchState)

    // // And the parameters should be submitted to the API
    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)
      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody: Cas1SpaceSearchParameters = JSON.parse(requests[1].body)

      const allPlacementCriteria = [...placementRequest.desirableCriteria, ...placementRequest.essentialCriteria]
      const filteredPlacementCriteria = [
        ...filterApLevelCriteria(allPlacementCriteria),
        ...filterRoomLevelCriteria(allPlacementCriteria),
      ]

      // And the first request to the API should contain the criteria from the placement request
      expect(initialSearchRequestBody).to.deep.equal({
        applicationId: placementRequest.applicationId,
        durationInDays: placementRequest.duration,
        startDate: placementRequest.expectedArrival,
        targetPostcodeDistrict: placementRequest.location,
        requirements: {},
        spaceCharacteristics: [
          placementRequest.type !== 'normal' && applyApTypeToAssessApType[placementRequest.type],
          ...filteredPlacementCriteria,
        ].filter(Boolean),
      })

      // And the second request to the API should contain the new criteria I submitted
      expect(secondSearchRequestBody).to.contain({
        applicationId: placementRequest.applicationId,
        durationInDays: placementRequest.duration,
        startDate: placementRequest.expectedArrival,
        targetPostcodeDistrict: newSearchState.postcode,
      })

      expect(secondSearchRequestBody.spaceCharacteristics).to.contain.members(
        [
          newSearchState.apType !== 'normal' && newSearchState.apType,
          ...newSearchState.apCriteria,
          ...newSearchState.roomCriteria,
        ].filter(Boolean),
      )
    })
  })

  it('allows me to view spaces and occupancy capacity', () => {
    const { occupancyViewPage, premiseCapacity, searchState } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // And I should see a summary of occupancy
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    // And I should see an occupancy calendar
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity, searchState.roomCriteria)
  })

  it('allows me to view spaces and occupancy capacity with blank licence expiry date', () => {
    const { occupancyViewPage, premiseCapacity, searchState } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(undefined)

    // And I should see a summary of occupancy
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    // And I should see an occupancy calendar
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity, searchState.roomCriteria)
  })

  it('allows me to submit invalid dates in the book your placement form on occupancy view page and displays appropriate validation messages', () => {
    const { occupancyViewPage } = shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // When I submit invalid dates
    occupancyViewPage.completeForm('2024-11-25', '2024-11-24')
    occupancyViewPage.clickContinue()

    // Then I should see validation messages
    occupancyViewPage.shouldShowErrorSummaryAndErrorMessage('The departure date must be after the arrival date')
  })

  const shouldVisitOccupancyViewPageAndShowMatchingDetails = (licenceExpiryDate: string | undefined) => {
    const durationDays = 15
    const startDate = '2024-07-23'
    const endDate = '2024-08-06'
    const totalCapacity = 10

    // Given I am signed in as a cru_member
    signIn(['cru_member'], ['cas1_space_booking_create'])

    // And there is a placement request waiting for me to match
    const person = personFactory.build()
    const premises = cas1PremisesFactory.build({ bedCount: totalCapacity })
    const placementRequest = placementRequestDetailFactory.build({
      person,
      expectedArrival: startDate,
      duration: durationDays,
      application: applicationFactory.build({
        licenceExpiryDate,
      }),
    })
    const { startDate: requestedArrivalDate, endDate: requestedDepartureDate } = placementDates(
      placementRequest.expectedArrival,
      placementRequest.duration,
    )
    const searchState = initialiseSearchState(placementRequest)
    const premiseCapacity = cas1PremiseCapacityFactory.build({
      startDate,
      endDate,
    })
    const spaceSearchResults = spaceSearchResultsFactory.build({
      results: [
        spaceSearchResultFactory.build({
          premises: premisesSearchResultSummary.build(premises),
        }),
        ...spaceSearchResultFactory.buildList(4),
      ],
    })

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubSinglePremises', premises)
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubPremiseCapacity', { premisesId: premises.id, startDate, endDate, premiseCapacity })

    // Given I have followed a link to a result from the suitability search
    const searchPage = SearchPage.visit(placementRequest)
    searchPage.clickSearchResult(spaceSearchResults.results[0])

    // When I visit the occupancy view page
    const occupancyViewPage = Page.verifyOnPage(OccupancyViewPage, premises.name)

    // Then I should see the details of the case I am matching
    occupancyViewPage.shouldShowMatchingDetails(startDate, durationDays, placementRequest)

    return {
      occupancyViewPage,
      placementRequest,
      premiseCapacity,
      premises,
      startDate,
      searchState,
      requestedArrivalDate,
      requestedDepartureDate,
    }
  }

  const shouldShowDayDetailsAndReturn = (
    occupancyViewPage: OccupancyViewPage,
    date: Date,
    premises: Cas1Premises,
    premiseCapacity: Cas1PremiseCapacity,
    criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ) => {
    const dayCapacity = occupancyViewPage.getOccupancyForDate(date, premiseCapacity)
    const premiseCapacityForDay = cas1PremiseCapacityFactory.build({
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

    const premisesDaySummary = cas1PremisesDaySummaryFactory.build({
      forDate: dayCapacity.date,
      capacity: premiseCapacityForDay.capacity[0],
    })
    cy.task('stubPremisesDaySummary', { premisesId: premises.id, date: dayCapacity.date, premisesDaySummary })

    // When I click on a day on the calendar
    occupancyViewPage.clickCalendarDay(dayCapacity.date)

    // Then I should see the page showing details for the day
    const dayAvailabilityPage = new DayAvailabilityPage(premises.id, premisesDaySummary, criteria)

    // And I should see availability details
    dayAvailabilityPage.shouldShowDayAvailability()

    // When I click back
    dayAvailabilityPage.clickBack()
  }

  it('allows me to view spaces and occupancy capacity and filter the result', () => {
    const { occupancyViewPage, premiseCapacity, premises, startDate, searchState } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    // And I should see the filter form with populated values
    occupancyViewPage.shouldShowFilters(startDate, 'Up to 6 weeks', [])

    // And I should see a summary of occupancy
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    // And I should see an occupancy calendar
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity, searchState.roomCriteria)

    // And I should be able to see any day's availability details
    const datesByStatus = occupancyViewPage.getDatesForEachAvailabilityStatus(premiseCapacity, searchState.roomCriteria)
    datesByStatus.forEach(date => {
      shouldShowDayDetailsAndReturn(occupancyViewPage, date, premises, premiseCapacity, searchState.roomCriteria)
    })

    // Then I should see the calendar again
    occupancyViewPage.shouldShowOccupancyCalendar(premiseCapacity, searchState.roomCriteria)

    // When I filter with an invalid date
    occupancyViewPage.filterAvailability({ newStartDate: '2025-02-35' })

    // Then I should see an error message
    occupancyViewPage.shouldShowErrorMessagesForFields(['startDate'], {
      startDate: 'Enter a valid date',
    })

    // When I filter for a different date and duration
    const newStartDate = '2024-08-01'
    const newEndDate = '2024-08-07'
    const newDuration = 'Up to 1 week'
    const newCriteria: Array<Cas1SpaceBookingCharacteristic> = ['isWheelchairDesignated', 'isStepFreeDesignated']
    const newCriteriaLabels = newCriteria.map(criterion => roomCharacteristicMap[criterion])
    const newPremiseCapacity = cas1PremiseCapacityFactory.build({
      startDate: newStartDate,
      endDate: newEndDate,
    })
    cy.task('stubPremiseCapacity', {
      premisesId: premises.id,
      startDate: newStartDate,
      endDate: newEndDate,
      premiseCapacity: newPremiseCapacity,
    })
    occupancyViewPage.filterAvailability({ newStartDate, newDuration, newCriteria: newCriteriaLabels })

    // Then I should see the filter form with updated values
    occupancyViewPage.shouldShowFilters(newStartDate, newDuration, newCriteriaLabels)

    // I can see the currently selected room criteria
    occupancyViewPage.shouldShowSelectedCriteria(newCriteriaLabels)
  })

  it('allows me to book a space', () => {
    const { occupancyViewPage, premises, placementRequest, searchState, requestedArrivalDate, requestedDepartureDate } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    const arrivalDate = '2024-07-23'
    const departureDate = '2024-08-08'

    // Then I can see the currently selected room criteria
    occupancyViewPage.shouldShowSelectedCriteria(
      searchState.roomCriteria.map(criterion => roomCharacteristicMap[criterion]),
    )

    // And I can see the requested dates in the hints
    occupancyViewPage.shouldShowDateFieldHint(
      'arrivalDate',
      `Requested arrival date: ${DateFormats.isoDateToUIDate(requestedArrivalDate, { format: 'dateFieldHint' })}`,
    )
    occupancyViewPage.shouldShowDateFieldHint(
      'departureDate',
      `Requested departure date: ${DateFormats.isoDateToUIDate(requestedDepartureDate, { format: 'dateFieldHint' })}`,
    )

    // And I fill in the requested arrival and departure dates
    occupancyViewPage.completeForm(arrivalDate, departureDate)
    occupancyViewPage.clickContinue()

    const page = Page.verifyOnPage(BookASpacePage)

    // Then I should see the details of the case I am matching
    page.shouldShowPersonHeader(placementRequest.person as FullPerson)

    // And I should see the details of the space I am booking
    page.shouldShowBookingDetails(placementRequest, premises, arrivalDate, departureDate, searchState.roomCriteria)

    // And when I complete the form
    const spaceBooking = cas1SpaceBookingFactory.upcoming().build()
    cy.task('stubSpaceBookingCreate', { placementRequestId: placementRequest.id, spaceBooking })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequest], status: 'matched' })
    page.clickSubmit()

    // Then I should be redirected to the 'Matched' tab
    const cruDashboard = Page.verifyOnPage(ListPage)

    // And I should see a success message
    cruDashboard.shouldShowSpaceBookingConfirmation(spaceBooking.person.crn, spaceBooking.premises.name)

    // And the booking details should have been sent to the API
    cy.task('verifyApiPost', apiPaths.placementRequests.spaceBookings.create({ id: placementRequest.id })).then(
      body => {
        expect(body).to.deep.equal({
          arrivalDate,
          departureDate,
          premisesId: premises.id,
          characteristics: [...searchState.apCriteria, ...searchState.roomCriteria],
        })
      },
    )
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
