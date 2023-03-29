import ListPage from '../../../cypress_shared/pages/match/listPlacementRequestsPage'
import SearchPage from '../../../cypress_shared/pages/match/searchPage'

import {
  bedSearchParametersFactory,
  bedSearchResultFactory,
  personFactory,
  placementRequestFactory,
} from '../../../server/testutils/factories'
import Page from '../../../cypress_shared/pages/page'

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
    const placementRequests = placementRequestFactory.buildList(1, { person })
    cy.task('stubPlacementRequests', placementRequests)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit(placementRequests)

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowPlacementRequests()

    // When I click on a placement request
    listPage.clickFindBed(placementRequests[0])

    // Then I should be taken to the search page
    const searchPage = Page.verifyOnPage(SearchPage, person.name)

    // And I should see the search results
    let numberOfSearches = 0
    searchPage.shouldDisplaySearchResults(bedSearchResults)
    numberOfSearches += 1

    const newSearchParameters = bedSearchParametersFactory.build()

    // When I enter details on the search page
    searchPage.changeSearchParameters(newSearchParameters)
    searchPage.clickSubmit()
    numberOfSearches += 1

    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)

      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody = JSON.parse(requests[1].body)

      expect(initialSearchRequestBody).to.contain({
        durationDays: placementRequests[0].duration,
        startDate: placementRequests[0].expectedArrival,
        postcodeDistrict: placementRequests[0].location,
        maxDistanceMiles: placementRequests[0].radius,
      })

      expect(secondSearchRequestBody).to.contain({
        durationDays: newSearchParameters.durationDays,
        startDate: newSearchParameters.startDate,
        postcodeDistrict: newSearchParameters.postcodeDistrict,
        maxDistanceMiles: newSearchParameters.maxDistanceMiles,
      })
    })
  })
})
