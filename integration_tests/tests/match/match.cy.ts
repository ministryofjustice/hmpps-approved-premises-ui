import PlacementRequestPage from '../../pages/match/placementRequestPage'
import ListPage from '../../pages/match/listPlacementRequestsPage'
import SearchPage from '../../pages/match/searchPage'

import {
  bedSearchParametersFactory,
  bedSearchResultFactory,
  personFactory,
  placementRequestFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'

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
    const bedSearchResults = bedSearchResultFactory.build()
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
    const firstBedSearchParameters = bedSearchParametersFactory.build({
      requiredCharacteristics: activePlacementRequest.essentialCriteria,
    })

    cy.task('stubPlacementRequest', activePlacementRequest)

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

    const newSearchParameters = bedSearchParametersFactory.build()

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
        durationDays: activePlacementRequest.duration,
        startDate: activePlacementRequest.expectedArrival,
        postcodeDistrict: activePlacementRequest.location,
        maxDistanceMiles: activePlacementRequest.radius,
      })

      expect(initialSearchRequestBody.requiredCharacteristics).to.have.members(activePlacementRequest.essentialCriteria)

      expect(secondSearchRequestBody).to.contain({
        durationDays: newSearchParameters.durationDays,
        startDate: newSearchParameters.startDate,
        postcodeDistrict: newSearchParameters.postcodeDistrict,
        maxDistanceMiles: newSearchParameters.maxDistanceMiles,
      })

      expect(secondSearchRequestBody.requiredCharacteristics).to.have.members(
        newSearchParameters.requiredCharacteristics,
      )
    })
  })
})
