import { addDays, weeksToDays } from 'date-fns'
import SuccessPage from '../../pages/match/successPage'
import ConfirmationPage from '../../pages/match/confirmationPage'
import SearchPage from '../../pages/match/searchPage'
import UnableToMatchPage from '../../pages/match/unableToMatchPage'

import {
  personFactory,
  placementRequestDetailFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultsFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { signIn } from '../signIn'
import { mapPlacementRequestToSpaceSearchParams } from '../../../server/utils/placementRequests/utils'
import { DateFormats } from '../../../server/utils/dateUtils'
import ListPage from '../../pages/admin/placementApplications/listPage'
import { Cas1SpaceSearchParameters } from '../../../server/@types/shared'
import { filterPlacementCriteriaToSpaceCharacteristics } from '../../../server/utils/matchUtils'

context('Placement Requests', () => {
  beforeEach(() => {
    process.env.ENABLE_V2_MATCH = 'true'

    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubApAreaReferenceData')
  })

  it('allows me to search for an available space', () => {
    // Given I am signed in as a cru_member
    signIn(['cru_member'])

    // And there is a placement request waiting for me to match
    const person = personFactory.build()
    const placementRequest = placementRequestDetailFactory.build({ person })
    const spaceSearchResults = spaceSearchResultsFactory.build()

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubPlacementRequest', placementRequest)

    // When I visit the search page
    const searchPage = SearchPage.visit(placementRequest)

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
    Page.verifyOnPage(SearchPage, person.name)

    // And the new search criteria should be selected
    searchPage.shouldShowSearchParametersInInputs(newSearchParameters)

    // And the parameters should be submitted to the API
    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)
      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody: Cas1SpaceSearchParameters = JSON.parse(requests[1].body)

      const filteredPlacementCriteria = filterPlacementCriteriaToSpaceCharacteristics([
        ...placementRequest.desirableCriteria,
        ...placementRequest.essentialCriteria,
      ])

      // And the first request to the API should contain the criteria from the placement request
      expect(initialSearchRequestBody).to.deep.equal({
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
      const durationInDays =
        weeksToDays(Number(newSearchParameters.durationWeeks)) + Number(newSearchParameters.durationDays)

      expect(secondSearchRequestBody).to.contain({
        durationInDays,
        startDate: newSearchParameters.startDate,
        targetPostcodeDistrict: newSearchParameters.targetPostcodeDistrict,
      })

      expect(secondSearchRequestBody.requirements.apTypes).to.contain.members(newSearchParameters.requirements.apTypes)
      expect(secondSearchRequestBody.requirements.spaceCharacteristics).to.contain.members(
        newSearchParameters.requirements.spaceCharacteristics,
      )
      expect(secondSearchRequestBody.requirements.genders).to.contain.members(newSearchParameters.requirements.genders)
    })
  })

  it('allows me to make a booking', () => {
    signIn(['cru_member'])

    // Given there is a placement request waiting for me to match
    const placementRequest = placementRequestDetailFactory.build({
      status: 'notMatched',
      person: personFactory.build(),
    })
    const bedSearchResults = bedSearchResultsFactory.build()

    const bedSearchParameters = mapPlacementRequestToBedSearchParams(placementRequest)
    const duration = Number(bedSearchParameters.durationWeeks) * 7 + Number(bedSearchParameters.durationDays)

    cy.task('stubSpaceSearch', { bedSearchResults })
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubBookingFromPlacementRequest', placementRequest)

    const searchPage = SearchPage.visit(placementRequest)
    // When I click to book the first space
    searchPage.clickSearchResult(bedSearchResults.results[0])

    // Then I should be shown the confirmation page
    const confirmationPage = Page.verifyOnPage(ConfirmationPage)

    // And the confirmation page should contain the details of my booking
    confirmationPage.shouldShowConfirmationDetails(bedSearchResults.results[0], bedSearchParameters.startDate, duration)

    // When I click on the confirm button
    confirmationPage.clickConfirm()

    // Then I should see a success message
    Page.verifyOnPage(SuccessPage)

    // And the booking details should have been sent to the API
    cy.task('verifyBookingFromPlacementRequest', placementRequest).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain({
        bedId: bedSearchResults.results[0].bed.id,
        arrivalDate: bedSearchParameters.startDate,
        departureDate: DateFormats.dateObjToIsoDate(
          addDays(DateFormats.isoToDateObj(bedSearchParameters.startDate), duration),
        ),
      })
    })
  })

  it('allows me to mark a placement request as unable to match', () => {
    signIn(['cru_member'])

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

    // Then I am able to complete a form to explain why I the spaces weren't suitable
    const unableToMatchPage = new UnableToMatchPage()

    // When I complete the form
    unableToMatchPage.completeForm()
    unableToMatchPage.clickSubmit()

    // Then I should see a success message on the list page
    Page.verifyOnPage(ListPage)
  })
})
