import { PersonSummary } from '@approved-premises/api'
import {
  cas1KeyworkerAllocationFactory,
  cas1PremisesSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  premisesSummaryFactory,
  staffMemberFactory,
} from '../../../server/testutils/factories'

import { PremisesListPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'

context('Premises', () => {
  describe('list', () => {
    it('should list all premises', () => {
      cy.task('reset')
      // Given I am logged in as a future manager
      signIn(['future_manager'])
      const premises = premisesSummaryFactory.buildList(5)
      cy.task('stubAllPremises', premises)
      cy.task('stubCas1AllPremises', premises)
      cy.task('stubApAreaReferenceData')

      // When I visit the premises page
      const v2PremisesListPage = PremisesListPage.visit()

      // Then I should see all of the premises listed
      v2PremisesListPage.shouldShowPremises(premises)
    })
  })

  describe('show', () => {
    const premises = cas1PremisesSummaryFactory.build()
    const placements = cas1SpaceBookingSummaryFactory.buildList(30)
    const staffMembers = staffMemberFactory.buildList(5)

    beforeEach(() => {
      cy.task('reset')

      // Given there is a premises in the database
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers })

      // And it has a list of upcoming placements
      cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements, residency: 'upcoming' })
    })

    describe('with placement list permission', () => {
      beforeEach(() => {
        // Given I am logged in as a future manager with placement list view permission
        signIn(['future_manager'], ['cas1_space_booking_list'])
      })

      it('should show a single premises details page', () => {
        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // Then I should see the premises details shown
        page.shouldShowAPArea(premises.apArea.name)
        page.shouldShowPremisesDetail()

        // And I should see the first page of placements for the premises
        page.shouldHavePlacementListLengthOf(20)
        page.shouldShowListOfPlacements(placements.slice(0, 20))

        // And I see a pagination control
        page.shouldHavePaginationControl()
      })

      it('should allow the user to change tab', () => {
        cy.task('stubSpaceBookingSummaryList', {
          premisesId: premises.id,
          placements,
          residency: 'current',
          sortBy: 'canonicalDepartureDate',
          sortDirection: 'asc',
          perPage: 2000,
        })
        cy.task('stubSpaceBookingSummaryList', {
          premisesId: premises.id,
          placements,
          residency: 'historic',
          sortBy: 'canonicalDepartureDate',
          sortDirection: 'desc',
        })

        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // Then the 'upcoming' tab should be selected by default
        page.shouldHaveTabSelected('Upcoming')

        // When I select to the 'current' tab
        page.shouldSelectTab('Current')

        // Then the 'current' tab should be selected
        page.shouldHaveTabSelected('Current')

        // When I select to the 'current' tab
        page.shouldSelectTab('Historical')

        // Then the 'current' tab should be selected
        page.shouldHaveTabSelected('Historical')
      })

      it('should let the user filter by keyworker', () => {
        const testKeyworker = staffMembers[2]
        const placementsWithKeyworker = cas1SpaceBookingSummaryFactory.buildList(6, {
          keyWorkerAllocation: cas1KeyworkerAllocationFactory.build({
            keyWorker: testKeyworker,
          }),
        })
        cy.task('stubSpaceBookingSummaryList', {
          premisesId: premises.id,
          placements: placementsWithKeyworker,
          residency: 'upcoming',
          keyWorkerStaffCode: testKeyworker.code,
        })

        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // When I filter the results by keyworker
        page.selectKeyworker(testKeyworker.name)
        page.clickApplyFilter()

        // Then I should see the form with the keyworker pre-selected
        page.shouldHaveSelectText('keyworker', testKeyworker.name)

        // And the results should be filtered
        page.shouldShowListOfPlacements(placementsWithKeyworker)
        page.shouldShowInEveryTableRow(testKeyworker.name)

        // When I clear the filter by selecting 'All keyworkers'
        page.selectKeyworker('All keyworkers')
        page.clickApplyFilter()

        // Then I should see the form with the keyworker pre-selected
        page.shouldHaveSelectText('keyworker', 'All keyworkers')

        // And all the results should be shown
        page.shouldHavePlacementListLengthOf(20)
        page.shouldShowListOfPlacements(placements.slice(0, 20))
      })

      it('should let the user search for placements by CRN or name', () => {
        const searchName = 'Aadland'
        const searchResults = [
          cas1SpaceBookingSummaryFactory.build({
            person: {
              name: 'Aadland Bertrand',
            } as unknown as PersonSummary,
          }),
        ]
        cy.task('stubSpaceBookingSummaryList', {
          premisesId: premises.id,
          placements: [],
          crnOrName: 'No results for this query',
          sortBy: 'canonicalArrivalDate',
          sortDirection: 'desc',
        })
        cy.task('stubSpaceBookingSummaryList', {
          premisesId: premises.id,
          placements: searchResults,
          crnOrName: searchName,
          sortBy: 'canonicalArrivalDate',
          sortDirection: 'desc',
        })

        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // And I select to the 'search' tab
        page.shouldSelectTab('Search for a booking')

        // Then the 'search' tab should be selected
        page.shouldHaveTabSelected('Search for a booking')

        // And I should see the search form
        page.shouldShowSearchForm()

        // And I should not see the results list
        page.shouldNotShowPlacementsResultsTable()

        // When I submit a search using the form
        page.searchByCrnOrName(searchName)

        // Then the 'search' tab should be selected
        page.shouldHaveTabSelected('Search for a booking')

        // And the search form should be populated with my search term
        page.shouldShowSearchForm(searchName)

        // And I should see the results
        page.shouldShowListOfPlacements(searchResults)

        // When I search for a name that returns no results
        cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements: [] })
        page.searchByCrnOrName('No results for this query')

        // Then the 'search' tab should be selected
        page.shouldHaveTabSelected('Search for a booking')

        // And the search form should be populated with my search term
        page.shouldShowSearchForm('No results for this query')

        // Then I should see a message that there are no results
        page.shouldShowNoResults()
      })

      it('should not show the placements section if space bookings are not enabled for the premises', () => {
        // Given there is a premises in the database that does not support space bookings
        const premisesSpaceBookingsDisabled = cas1PremisesSummaryFactory.build({ supportsSpaceBookings: false })
        cy.task('stubSinglePremises', premisesSpaceBookingsDisabled)

        // When I visit premises details page
        const page = PremisesShowPage.visit(premisesSpaceBookingsDisabled)

        // Then I should not see the placements section
        page.shouldNotShowPlacementsSection()
      })
    })

    describe('without placement list view permission', () => {
      beforeEach(() => {
        // Given I am logged in as a user without placement list view permission
        signIn(['future_manager'])
      })

      it('should not show the placements section', () => {
        // When I visit premises details page
        const page = PremisesShowPage.visit(premises)

        // Then I should not see a list of bookings
        page.shouldNotShowPlacementsSection()
      })
    })
  })
})
