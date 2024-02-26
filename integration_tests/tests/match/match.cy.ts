import { addDays, weeksToDays } from 'date-fns'
import SuccessPage from '../../pages/match/successPage'
import ConfirmationPage from '../../pages/match/confirmationPage'
import PlacementRequestPage from '../../pages/match/placementRequestPage'
import ListPage from '../../pages/match/listPlacementRequestsPage'
import SearchPage from '../../pages/match/searchPage'
import UnableToMatchPage from '../../pages/match/unableToMatchPage'

import {
  bedSearchParametersUiFactory,
  bedSearchResultsFactory,
  personFactory,
  placementApplicationTaskFactory,
  placementRequestDetailFactory,
  placementRequestTaskFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { DateFormats } from '../../../server/utils/dateUtils'
import { PlacementCriteria } from '../../../server/@types/shared/models/PlacementCriteria'
import { mapPlacementRequestToBedSearchParams } from '../../../server/utils/placementRequests/utils'
import { FullPerson } from '../../../server/@types/shared'

context.skip('Placement Requests', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()
  })

  it('shows a list of matcher tasks', () => {
    // Given there placement request tasks in the database
    const notMatchedTasks = placementRequestTaskFactory.buildList(1, { placementRequestStatus: 'notMatched' })
    const unableToMatchTasks = placementRequestTaskFactory.buildList(1, { placementRequestStatus: 'unableToMatch' })
    const matchedTasks = placementRequestTaskFactory.buildList(1, { placementRequestStatus: 'matched' })
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    cy.task('stubTasks', [...notMatchedTasks, ...unableToMatchTasks, ...matchedTasks, ...placementApplicationTasks])

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowTasks(notMatchedTasks)

    // When I click on the Placement Applications Tab
    listPage.clickPlacementApplications()

    // Then I should see the placement applications
    listPage.shouldShowPlacementApplicationTasks(placementApplicationTasks)

    // When I click on the unable to match tab
    listPage.clickUnableToMatch()

    // Then I should see the unable to match placement requests
    listPage.shouldShowTasks(unableToMatchTasks)

    // When I click on the completed tab
    listPage.clickCompleted()

    // Then I should see the completed placement requests
    listPage.shouldShowTasks(matchedTasks)

    // When I click on the active cases tab
    listPage.clickActive()

    // Then I should see the placement requests that are allocated to me
    listPage.shouldShowTasks(notMatchedTasks)
  })

  it('allows me to search for available rooms', () => {
    // Given there is a placement request waiting for me to match
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

    const placementRequestTask = placementRequestTaskFactory.build({
      id: placementRequest.id,
      placementRequestStatus: placementRequest.status,
    })

    const firstBedSearchParameters = bedSearchParametersUiFactory.build({
      requiredCharacteristics: [...essentialCriteria, ...desirableCriteria],
    })

    const bedSearchResults = bedSearchResultsFactory.build()

    cy.task('stubTasks', [placementRequestTask])
    cy.task('stubBedSearch', { bedSearchResults })
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubBookingFromPlacementRequest', placementRequest)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()

    // And I click on a placement request
    listPage.clickFindBed(placementRequest)

    // Then I should be taken to the placement request's page
    const showPage = Page.verifyOnPage(PlacementRequestPage, placementRequest)

    // And I should see the placement request information
    showPage.shouldShowAssessmentDetails()
    showPage.shouldShowMatchingInformationSummary()
    showPage.shouldShowDocuments()
    showPage.shouldShowPreviousCancellations()

    // When I click on the search button
    showPage.clickSearch()

    // Then I should be taken to the search page
    const searchPage = Page.verifyOnPage(SearchPage, person.name)

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

    const newSearchParameters = bedSearchParametersUiFactory.build({
      requiredCharacteristics: [desirableCriteria[0], desirableCriteria[1]],
    })

    // When I enter details on the search page
    searchPage.changeSearchParameters(newSearchParameters)
    searchPage.clickSubmit()
    numberOfSearches += 1

    // Then I should see the search results
    Page.verifyOnPage(SearchPage, person.name)

    // Then I should still see the essential criteria
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
    // Given there is a placement request waiting for me to match
    const placementRequest = placementRequestDetailFactory.build({
      status: 'notMatched',
      person: personFactory.build(),
    })
    const placementRequestTask = placementRequestTaskFactory.build({
      id: placementRequest.id,
      placementRequestStatus: placementRequest.status,
    })
    const bedSearchResults = bedSearchResultsFactory.build()

    const bedSearchParameters = mapPlacementRequestToBedSearchParams(placementRequest)
    const duration = Number(bedSearchParameters.durationWeeks) * 7 + Number(bedSearchParameters.durationDays)

    cy.task('stubTasks', [placementRequestTask])
    cy.task('stubBedSearch', { bedSearchResults })
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubBookingFromPlacementRequest', placementRequest)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()

    // And I click on a placement request
    listPage.clickFindBed(placementRequest)

    // And I click on the search button
    const showPage = new PlacementRequestPage(placementRequest)
    showPage.clickSearch()

    // And I click to book a room
    const searchPage = new SearchPage((placementRequest.person as FullPerson).name)
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
    // Given there is a placement request waiting for me to match
    const placementRequest = placementRequestDetailFactory.build({
      status: 'notMatched',
      person: personFactory.build(),
    })
    const placementRequestTask = placementRequestTaskFactory.build({
      id: placementRequest.id,
      placementRequestStatus: placementRequest.status,
    })
    const bedSearchResults = bedSearchResultsFactory.build()

    cy.task('stubTasks', [placementRequestTask])
    cy.task('stubBedSearch', { bedSearchResults })
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubBookingFromPlacementRequest', placementRequest)
    cy.task('stubUnableToMatchPlacementRequest', placementRequest)

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()

    // And I click on a placement request
    listPage.clickFindBed(placementRequest)

    // And I click on the search button
    const showPage = new PlacementRequestPage(placementRequest)
    showPage.clickSearch()

    // Given I am unable to match the placement request to a bed
    const searchPage = new SearchPage((placementRequest.person as FullPerson).name)
    searchPage.clickUnableToMatch()

    // When I complete the form and click submit
    const unableToMatchPage = new UnableToMatchPage()
    unableToMatchPage.completeForm()
    unableToMatchPage.clickSubmit()

    // Then I should see a success message on the list page
    Page.verifyOnPage(ListPage)
    listPage.shouldShowBanner('Placement request marked unable to match')
  })
})
