import { addWeeks } from 'date-fns'
import SuccessPage from '../../pages/match/successPage'
import ConfirmationPage from '../../pages/match/confirmationPage'
import PlacementRequestPage from '../../pages/match/placementRequestPage'
import ListPage from '../../pages/match/listPlacementRequestsPage'
import SearchPage from '../../pages/match/searchPage'

import {
  bedSearchParametersUiFactory,
  bedSearchResultsFactory,
  personFactory,
  placementRequestFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { DateFormats } from '../../../server/utils/dateUtils'

context('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows a list of placementRequests', () => {
    // Given I am logged in
    cy.signIn()

    // And there are beds and placement requests in the database
    const bedSearchResults = bedSearchResultsFactory.build()
    cy.task('stubBedSearch', { bedSearchResults })
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })
    const activePlacementRequests = placementRequestFactory.buildList(1, { person, status: 'notMatched' })
    const unableToMatchPlacementRequests = placementRequestFactory.buildList(3, { status: 'unableToMatch' })
    const matchedPlacementRequests = placementRequestFactory.buildList(5, { status: 'matched' })

    cy.task('stubPlacementRequests', [
      ...activePlacementRequests,
      ...unableToMatchPlacementRequests,
      ...matchedPlacementRequests,
    ])
    const activePlacementRequest = activePlacementRequests[0]
    const firstBedSearchParameters = bedSearchParametersUiFactory.build({
      requiredCharacteristics: activePlacementRequest.essentialCriteria,
    })

    cy.task('stubPlacementRequest', activePlacementRequest)
    cy.task('stubBookingFromPlacementRequest', activePlacementRequest)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowPlacementRequests(activePlacementRequests)

    // When I click on the unable to match tab
    listPage.clickUnableToMatch()

    // Then I should see the unable to match placement requests
    listPage.shouldShowPlacementRequests(unableToMatchPlacementRequests)

    // When I click on the completed tab
    listPage.clickCompleted()

    // Then I should see the completed placement requests
    listPage.shouldShowPlacementRequests(matchedPlacementRequests)

    // When I click on the active cases tab
    listPage.clickActive()

    // And I click on a placement request
    listPage.clickFindBed(activePlacementRequest)

    // Then I should be taken to the placement request's page
    const showPage = Page.verifyOnPage(PlacementRequestPage, activePlacementRequest)

    // And I should see the placement request information
    showPage.shouldShowAssessmentDetails()
    showPage.shouldShowMatchingInformationSummary()
    showPage.shouldShowDocuments()

    // When I click on the search button
    showPage.clickSearch()

    // Then I should be taken to the search page
    const searchPage = Page.verifyOnPage(SearchPage, person.name)

    // And I should see the search results
    let numberOfSearches = 0
    searchPage.shouldDisplaySearchResults(bedSearchResults, firstBedSearchParameters)
    numberOfSearches += 1

    const newSearchParameters = bedSearchParametersUiFactory.build()

    // When I enter details on the search page
    searchPage.changeSearchParameters(newSearchParameters)
    searchPage.clickSubmit()
    numberOfSearches += 1

    // Then I should see the search results
    Page.verifyOnPage(SearchPage, person.name)

    // And the parameters should be submitted to the API
    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)

      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody = JSON.parse(requests[1].body)

      expect(initialSearchRequestBody).to.contain({
        durationDays: activePlacementRequest.duration * 7,
        startDate: activePlacementRequest.expectedArrival,
        postcodeDistrict: activePlacementRequest.location,
        maxDistanceMiles: activePlacementRequest.radius,
      })

      expect(initialSearchRequestBody.requiredCharacteristics).to.have.members(activePlacementRequest.essentialCriteria)

      const durationDays = Number(newSearchParameters.durationWeeks) * 7

      expect(secondSearchRequestBody).to.contain({
        durationDays,
        startDate: newSearchParameters.startDate,
        postcodeDistrict: newSearchParameters.postcodeDistrict,
        maxDistanceMiles: Number(newSearchParameters.maxDistanceMiles),
      })

      expect(secondSearchRequestBody.requiredCharacteristics).to.have.members(
        newSearchParameters.requiredCharacteristics,
      )
    })

    // When I click on a booking
    searchPage.clickSearchResult(bedSearchResults.results[0])

    // Then I should be shown the confirmation page
    const confirmationPage = Page.verifyOnPage(ConfirmationPage)

    // And the confirmation page should contain the details of my booking
    confirmationPage.shouldShowConfirmationDetails(bedSearchResults.results[0], newSearchParameters)

    // When I click on the confirm button
    confirmationPage.clickConfirm()

    // Then I should see a success message
    Page.verifyOnPage(SuccessPage)

    // And the booking details should have been sent to the API
    cy.task('verifyBookingFromPlacementRequest', activePlacementRequest).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain({
        bedId: bedSearchResults.results[0].bed.id,
        arrivalDate: newSearchParameters.startDate,
        departureDate: DateFormats.dateObjToIsoDate(
          addWeeks(DateFormats.isoToDateObj(newSearchParameters.startDate), Number(newSearchParameters.durationWeeks)),
        ),
      })
    })
  })
})
