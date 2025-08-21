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
  cas1PlacementRequestDetailFactory,
  spaceSearchResultFactory,
  spaceSearchResultsFactory,
  cas1PlacementRequestSummaryFactory,
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
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCruManagementAreaReferenceData')

    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')
  })
  const defaultLicenceExpiryDate = '2030-06-05'

  it('allows me to search for an available space', () => {
    AND('there is a placement request waiting for me to match')
    const person = personFactory.build()
    const placementRequest = cas1PlacementRequestDetailFactory.build({ person })
    const spaceSearchResults = spaceSearchResultsFactory.build()

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubPlacementRequest', placementRequest)

    WHEN('I visit the search page')
    const searchPage = SearchPage.visit(placementRequest)

    THEN('I should see the details of the case I am matching')
    searchPage.shouldShowCaseDetails(placementRequest)

    AND('I should see the search results')
    let numberOfSearches = 0
    searchPage.shouldDisplaySearchResults(spaceSearchResults, placementRequest.location)
    numberOfSearches += 1

    GIVEN('I want to search for a different space')
    WHEN('I enter new details on the search screen')
    const newSearchState = spaceSearchState.build()
    searchPage.changeSearchParameters(newSearchState)
    searchPage.clickSubmit()
    numberOfSearches += 1

    THEN('I should see the search results')
    Page.verifyOnPage(SearchPage)

    AND('the new search criteria should be selected')
    searchPage.shouldShowSearchParametersInInputs(newSearchState)

    AND('the parameters should be submitted to the API')
    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)
      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody: Cas1SpaceSearchParameters = JSON.parse(requests[1].body)

      const allPlacementCriteria = [...placementRequest.desirableCriteria, ...placementRequest.essentialCriteria]
      const filteredPlacementCriteria = [
        ...filterApLevelCriteria(allPlacementCriteria),
        ...filterRoomLevelCriteria(allPlacementCriteria),
      ]
      AND('the first request to the API should contain the criteria from the placement request')
      expect(initialSearchRequestBody).to.deep.equal({
        applicationId: placementRequest.applicationId,
        durationInDays: placementRequest.duration,
        startDate: placementRequest.expectedArrival,
        targetPostcodeDistrict: placementRequest.location,
        spaceCharacteristics: [
          placementRequest.type !== 'normal' && applyApTypeToAssessApType[placementRequest.type],
          ...filteredPlacementCriteria,
        ].filter(Boolean),
      })

      AND('the second request to the API should contain the new criteria I submitted')
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

    AND('I should see a summary of occupancy')
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    AND('I should see an occupancy calendar')
    occupancyViewPage.shouldShowCalendar({ premisesCapacity: premiseCapacity, criteria: searchState.roomCriteria })
  })

  it('allows me to view spaces and occupancy capacity with blank licence expiry date', () => {
    const { occupancyViewPage, premiseCapacity, searchState } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(undefined)

    AND('I should see a summary of occupancy')
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    AND('I should see an occupancy calendar')
    occupancyViewPage.shouldShowCalendar({ premisesCapacity: premiseCapacity, criteria: searchState.roomCriteria })
  })

  it('allows me to submit invalid dates in the book your placement form on occupancy view page and displays appropriate validation messages', () => {
    const { occupancyViewPage } = shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    WHEN('I submit invalid dates')
    occupancyViewPage.completeForm('2024-11-25', '2024-11-24')
    occupancyViewPage.clickContinue()

    THEN('I should see validation messages')
    occupancyViewPage.shouldShowErrorSummaryAndErrorMessage('The departure date must be after the arrival date')
  })

  const shouldVisitOccupancyViewPageAndShowMatchingDetails = (licenceExpiryDate: string | undefined) => {
    const durationDays = 15
    const startDate = '2024-07-23'
    const endDate = '2024-08-06'
    const totalCapacity = 10

    AND('there is a placement request waiting for me to match')
    const person = personFactory.build()
    const premises = cas1PremisesFactory.build({ bedCount: totalCapacity })
    const placementRequest = cas1PlacementRequestDetailFactory.build({
      person,
      expectedArrival: startDate,
      duration: durationDays,
      application: applicationFactory.build({
        licenceExpiryDate,
      }),
    })
    const placementRequestSummary = cas1PlacementRequestSummaryFactory
      .fromPlacementRequestDetail(placementRequest)
      .build()
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
          premises: premisesSearchResultSummary.fromPremises(premises).build(),
        }),
        ...spaceSearchResultFactory.buildList(4),
      ],
    })

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubSinglePremises', premises)
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubPremisesCapacity', { premisesId: premises.id, startDate, endDate, premiseCapacity })

    GIVEN('I have followed a link to a result from the suitability search')
    const searchPage = SearchPage.visit(placementRequest)
    searchPage.clickSearchResult(spaceSearchResults.results[0])

    WHEN('I visit the occupancy view page')
    const occupancyViewPage = Page.verifyOnPage(OccupancyViewPage, premises.name)

    THEN('I should see the details of the case I am matching')
    occupancyViewPage.shouldShowMatchingDetails(startDate, durationDays, placementRequest)

    return {
      occupancyViewPage,
      placementRequest,
      placementRequestSummary,
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
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      startDate: dayCapacity.date,
      endDate: dayCapacity.date,
      premiseCapacity: premiseCapacityForDay,
    })

    const premisesDaySummary = cas1PremisesDaySummaryFactory.build({
      forDate: dayCapacity.date,
    })
    cy.task('stubPremisesDaySummary', { premisesId: premises.id, date: dayCapacity.date, premisesDaySummary })

    WHEN('I click on a day on the calendar')
    occupancyViewPage.clickCalendarDay(dayCapacity.date)

    THEN('I should see the page showing details for the day')
    const dayAvailabilityPage = new DayAvailabilityPage(premisesDaySummary, dayCapacity, criteria)

    AND('I should see availability details')
    dayAvailabilityPage.shouldShowDayAvailability()

    WHEN('I click back')
    dayAvailabilityPage.clickBack()
  }

  it('allows me to view spaces and occupancy capacity and filter the result', () => {
    const { occupancyViewPage, premiseCapacity, premises, startDate, searchState } =
      shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    AND('I should see the filter form with populated values')
    occupancyViewPage.shouldShowFilters(startDate, 'Up to 6 weeks', [])

    AND('I should see a summary of occupancy')
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    AND('I should see an occupancy calendar')
    occupancyViewPage.shouldShowCalendar({ premisesCapacity: premiseCapacity, criteria: searchState.roomCriteria })

    AND("I should be able to see any day's availability details")
    const datesByStatus = occupancyViewPage.getDatesForEachAvailabilityStatus(premiseCapacity, searchState.roomCriteria)
    datesByStatus.forEach(date => {
      shouldShowDayDetailsAndReturn(occupancyViewPage, date, premises, premiseCapacity, searchState.roomCriteria)
    })

    AND('I should see a summary of occupancy')
    occupancyViewPage.shouldShowOccupancySummary(premiseCapacity, searchState.roomCriteria)

    THEN('I should see the calendar again')
    occupancyViewPage.shouldShowCalendar({ premisesCapacity: premiseCapacity, criteria: searchState.roomCriteria })

    WHEN('I filter with an invalid date')
    occupancyViewPage.filterAvailability({ newStartDate: '2025-02-35' })

    THEN('I should see an error message')
    occupancyViewPage.shouldShowErrorMessagesForFields(['startDate'], {
      startDate: 'Enter a valid date',
    })

    WHEN('I filter for a different date and duration')
    const newStartDate = '2024-08-01'
    const newEndDate = '2024-08-07'
    const newDuration = 'Up to 1 week'
    const newCriteria: Array<Cas1SpaceBookingCharacteristic> = ['isWheelchairDesignated', 'isStepFreeDesignated']
    const newCriteriaLabels = newCriteria.map(criterion => roomCharacteristicMap[criterion])
    const newPremiseCapacity = cas1PremiseCapacityFactory.build({
      startDate: newStartDate,
      endDate: newEndDate,
    })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      startDate: newStartDate,
      endDate: newEndDate,
      premiseCapacity: newPremiseCapacity,
    })
    occupancyViewPage.filterAvailability({ newStartDate, newDuration, newCriteria: newCriteriaLabels })

    THEN('I should see the filter form with updated values')
    occupancyViewPage.shouldShowFilters(newStartDate, newDuration, newCriteriaLabels)

    // I can see the currently selected room criteria
    occupancyViewPage.shouldShowSelectedCriteria(newCriteriaLabels)
  })

  it('allows me to book a space', () => {
    const {
      occupancyViewPage,
      premises,
      placementRequest,
      placementRequestSummary,
      searchState,
      requestedArrivalDate,
      requestedDepartureDate,
    } = shouldVisitOccupancyViewPageAndShowMatchingDetails(defaultLicenceExpiryDate)

    const arrivalDate = '2024-07-23'
    const departureDate = '2024-08-08'

    THEN('I can see the currently selected room criteria')
    occupancyViewPage.shouldShowSelectedCriteria(
      searchState.roomCriteria.map(criterion => roomCharacteristicMap[criterion]),
    )

    AND('I can see the requested dates in the hints')
    occupancyViewPage.shouldShowDateFieldHint(
      'arrivalDate',
      `Requested arrival date: ${DateFormats.isoDateToUIDate(requestedArrivalDate, { format: 'dateFieldHint' })}`,
    )
    occupancyViewPage.shouldShowDateFieldHint(
      'departureDate',
      `Requested departure date: ${DateFormats.isoDateToUIDate(requestedDepartureDate, { format: 'dateFieldHint' })}`,
    )

    AND('I fill in the requested arrival and departure dates')
    occupancyViewPage.completeForm(arrivalDate, departureDate)
    occupancyViewPage.clickContinue()

    const page = Page.verifyOnPage(BookASpacePage)

    THEN('I should see the details of the case I am matching')
    page.shouldShowPersonHeader(placementRequest.person as FullPerson)

    AND('I should see the details of the space I am booking')
    page.shouldShowBookingDetails(placementRequest, premises, arrivalDate, departureDate, searchState.roomCriteria)

    AND('when I complete the form')
    const spaceBooking = cas1SpaceBookingFactory.upcoming().build({ placementRequestId: placementRequest.id })
    cy.task('stubSpaceBookingCreate', { placementRequestId: placementRequest.id, spaceBooking })
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequestSummary], status: 'matched' })
    cy.task('stubPlacementRequest', placementRequest)
    page.clickSubmit()

    THEN("I should be redirected to the 'Matched' tab")
    const cruDashboard = Page.verifyOnPage(ListPage)

    AND('I should see a success message')
    cruDashboard.shouldShowSpaceBookingConfirmation(spaceBooking, placementRequest)

    AND('the booking details should have been sent to the API')
    cy.task(
      'verifyApiPost',
      apiPaths.placementRequests.spaceBookings.create({ placementRequestId: placementRequest.id }),
    ).then(body => {
      expect(body).to.deep.equal({
        arrivalDate,
        departureDate,
        premisesId: premises.id,
        characteristics: [...searchState.apCriteria, ...searchState.roomCriteria],
      })
    })
  })

  it('allows me to mark a placement request as unable to match', () => {
    GIVEN('there is a placement request waiting for me to match')
    const placementRequest = cas1PlacementRequestDetailFactory.notMatched().build({
      person: personFactory.build(),
    })
    const placementRequestSummary = cas1PlacementRequestSummaryFactory
      .fromPlacementRequestDetail(placementRequest)
      .build()

    const spaceSearchResults = spaceSearchResultsFactory.build()

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubUnableToMatchPlacementRequest', placementRequest)
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequestSummary], status: 'notMatched' })

    WHEN('I visit the search')
    const searchPage = SearchPage.visit(placementRequest)

    AND('I declare that I do not see a suitable space')
    searchPage.clickUnableToMatch()

    THEN("I am able to complete a form to explain why the spaces weren't suitable")
    const unableToMatchPage = new UnableToMatchPage()

    WHEN('I complete the form')
    unableToMatchPage.completeForm()
    unableToMatchPage.clickSubmit()

    THEN('I should see a success message on the list page')
    Page.verifyOnPage(ListPage)
  })
})
