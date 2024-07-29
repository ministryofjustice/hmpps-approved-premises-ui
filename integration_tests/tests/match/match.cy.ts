import { addDays, weeksToDays } from 'date-fns'
import SuccessPage from '../../pages/match/successPage'
import ConfirmationPage from '../../pages/match/confirmationPage'
import SearchPage from '../../pages/match/searchPage'
import UnableToMatchPage from '../../pages/match/unableToMatchPage'

import {
  bedSearchParametersUiFactory,
  bedSearchResultsFactory,
  personFactory,
  placementRequestDetailFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { PlacementCriteria } from '../../../server/@types/shared/models/PlacementCriteria'
import { signIn } from '../signIn'
import { mapPlacementRequestToBedSearchParams } from '../../../server/utils/placementRequests/utils'
import { DateFormats } from '../../../server/utils/dateUtils'
import ListPage from '../../pages/admin/placementApplications/listPage'

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
    const essentialCriteria = ['isPIPE', 'acceptsHateCrimeOffenders'] as Array<PlacementCriteria>
    const desirableCriteria = ['isCatered', 'hasEnSuite'] as Array<PlacementCriteria>
    const placementRequest = placementRequestDetailFactory.build({
      person,
      status: 'notMatched',
      duration: 15,
      essentialCriteria,
      desirableCriteria,
    })
    const firstBedSearchParameters = bedSearchParametersUiFactory.build({
      requiredCharacteristics: [...essentialCriteria, ...desirableCriteria],
    })
    const bedSearchResults = bedSearchResultsFactory.build()

    cy.task('stubSpaceSearch', spaceSearchResults)
    cy.task('stubPlacementRequest', placementRequest)

    // When I visit the search page
    const searchPage = SearchPage.visit(placementRequest)

    // Then I should see the essential criteria
    searchPage.shouldShowEssentialCriteria(placementRequest.essentialCriteria)

    // And the desirable criteria should be selected
    searchPage.shouldHaveCriteriaSelected([
      ...placementRequest.essentialCriteria,
      ...placementRequest.desirableCriteria,
    ])

    // And I should see the search results
    let numberOfSearches = 0
    searchPage.shouldDisplaySearchResults(bedSearchResults, firstBedSearchParameters)
    numberOfSearches += 1

    // Given I want to search for a different space
    // When I enter new details on the search screen
    const newSearchParameters = bedSearchParametersUiFactory.build({
      requiredCharacteristics: [desirableCriteria[0], desirableCriteria[1]],
    })

    searchPage.changeSearchParameters(newSearchParameters)
    searchPage.clickSubmit()
    numberOfSearches += 1

    // Then I should see the search results
    Page.verifyOnPage(SearchPage, person.name)

    // And I should still see the essential criteria
    searchPage.shouldShowEssentialCriteria(placementRequest.essentialCriteria)

    // And the new desirable criteria should be selected
    searchPage.shouldHaveCriteriaSelected([
      ...placementRequest.essentialCriteria,
      ...newSearchParameters.requiredCharacteristics,
    ])

    // And the parameters should be submitted to the API
    cy.task('verifySearchSubmit').then(requests => {
      expect(requests).to.have.length(numberOfSearches)

      const initialSearchRequestBody = JSON.parse(requests[0].body)
      const secondSearchRequestBody = JSON.parse(requests[1].body)

      // And the first request to the API should contain the criteria from the placement request
      expect(initialSearchRequestBody).to.contain({
        durationDays: placementRequest.duration,
        startDate: placementRequest.expectedArrival,
        postcodeDistrict: placementRequest.location,
        maxDistanceMiles: placementRequest.radius,
      })

      expect(initialSearchRequestBody.requiredCharacteristics).to.have.members([
        ...placementRequest.essentialCriteria,
        ...placementRequest.desirableCriteria,
      ])

      // And the second request to the API should contain the new criteria I submitted
      const durationDays =
        weeksToDays(Number(newSearchParameters.durationWeeks)) + Number(newSearchParameters.durationDays)

      expect(secondSearchRequestBody).to.contain({
        durationDays,
        startDate: newSearchParameters.startDate,
        postcodeDistrict: newSearchParameters.postcodeDistrict,
        maxDistanceMiles: Number(newSearchParameters.maxDistanceMiles),
      })

      expect(secondSearchRequestBody.requiredCharacteristics).to.have.members([
        ...placementRequest.essentialCriteria,
        ...newSearchParameters.requiredCharacteristics,
      ])
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
