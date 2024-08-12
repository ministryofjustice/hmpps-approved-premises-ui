import SearchPage from '../../pages/match/searchPage'
import UnableToMatchPage from '../../pages/match/unableToMatchPage'

import {
  personFactory,
  placementRequestDetailFactory,
  spaceBookingFactory,
  spaceBookingRequirementsFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultsFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { signIn } from '../signIn'

import ListPage from '../../pages/admin/placementApplications/listPage'
import { Cas1SpaceSearchParameters, PlacementCriteria } from '../../../server/@types/shared'
import { filterOutAPTypes, placementDates } from '../../../server/utils/match'
import BookASpacePage from '../../pages/match/bookASpacePage'

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

  it('allows me to book a space', () => {
    // Given I am signed in as a cru_member
    signIn(['cru_member'])

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
    const requirements = spaceBookingRequirementsFactory.build({ apType, gender: placementRequest.gender })
    const spaceBooking = spaceBookingFactory.build({ requirements })
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
        placementRequestId: placementRequest.id,
        requirements: {
          ...spaceBooking.requirements,
          essentialCharacteristics: placementRequest.essentialCriteria,
          desirableCharacteristics: placementRequest.desirableCriteria,
        },
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
