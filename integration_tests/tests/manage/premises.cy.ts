import { PersonSummary } from '@approved-premises/api'
import {
  cas1BedDetailFactory,
  cas1KeyworkerAllocationFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesBedSummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingSummaryFactory,
  cruManagementAreaFactory,
  staffMemberFactory,
} from '../../../server/testutils/factories'

import { PremisesListPage, PremisesShowPage } from '../../pages/manage'

import { signIn } from '../signIn'
import BedsListPage from '../../pages/manage/bed/bedList'
import Page from '../../pages/page'
import BedShowPage from '../../pages/manage/bed/bedShow'

context('Premises', () => {
  describe('list', () => {
    it('should list all premises and allow filtering by area', () => {
      cy.task('reset')

      const cruManagementAreas = cruManagementAreaFactory.buildList(5)
      const userCruArea = cruManagementAreas[1]
      const filterCruArea = cruManagementAreas[3]

      const allPremises = cas1PremisesBasicSummaryFactory.buildList(5)
      cy.task('stubCas1AllPremises', { premises: allPremises })

      const userPremises = cas1PremisesBasicSummaryFactory.buildList(3)
      cy.task('stubCas1AllPremises', { premises: userPremises, cruManagementAreaId: userCruArea.id })

      const filteredPremises = cas1PremisesBasicSummaryFactory.buildList(1)
      cy.task('stubCas1AllPremises', { premises: filteredPremises, cruManagementAreaId: filterCruArea.id })

      cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })

      // Given I am signed in as a future manager
      signIn('future_manager', { cruManagementArea: userCruArea })

      // When I visit the premises page
      const premisesListPage = PremisesListPage.visit()

      // Then I should see premises in the user's CRU management area listed
      premisesListPage.shouldHaveSelectText('selectedArea', userCruArea.name)
      premisesListPage.shouldShowPremises(userPremises)

      // When I select a specific area
      premisesListPage.filterPremisesByArea(filterCruArea.name)

      // Then I should see the premises for the selected area
      premisesListPage.shouldHaveSelectText('selectedArea', filterCruArea.name)
      premisesListPage.shouldShowPremises(filteredPremises)

      // When I select 'All areas'
      premisesListPage.filterPremisesByArea('All areas')

      // Then I should see all premises
      premisesListPage.shouldHaveSelectText('selectedArea', 'All areas')
      premisesListPage.shouldShowPremises(allPremises)
    })
  })

  describe('show', () => {
    const premises = cas1PremisesFactory.build()
    const placements = cas1SpaceBookingSummaryFactory.buildList(30)
    const keyworkers = staffMemberFactory.keyworker().buildList(5)

    beforeEach(() => {
      cy.task('reset')

      // Given there is a premises in the database
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers: keyworkers })

      // And it has a list of placements
      cy.task('stubSpaceBookingSummaryList', {
        premisesId: premises.id,
        placements,
        residency: 'current',
        sortBy: 'personName',
        sortDirection: 'asc',
        perPage: 2000,
      })
      cy.task('stubSpaceBookingSummaryList', {
        premisesId: premises.id,
        placements,
        residency: 'upcoming',
        sortBy: 'canonicalArrivalDate',
        sortDirection: 'asc',
        perPage: 20,
      })
      cy.task('stubSpaceBookingSummaryList', {
        premisesId: premises.id,
        placements,
        residency: 'historic',
        sortBy: 'canonicalDepartureDate',
        sortDirection: 'desc',
      })

      // Given I am signed in as a future manager
      signIn('future_manager')
    })

    it('should show a single premises details page', () => {
      // When I visit premises details page
      const page = PremisesShowPage.visit(premises)

      // Then I should see the premises details shown
      page.shouldShowAPArea(premises.apArea.name)
      page.shouldShowPremisesDetail()

      // And I should see the first page of placements for the premises
      page.shouldHavePlacementListLengthOf(30)
      page.shouldShowListOfPlacements(placements.slice(0, 20))
    })

    it('should allow the user to change tab', () => {
      // When I visit premises details page
      const page = PremisesShowPage.visit(premises)

      // Then the 'current' tab should be selected by default
      page.shouldHaveActiveTab('Current')

      // And it should show all 30 placements
      page.shouldHavePlacementListLengthOf(30)

      // When I select the 'upcoming' tab
      page.clickTab('Upcoming')

      // Then the 'current' tab should be selected
      page.shouldHaveActiveTab('Upcoming')

      // And it should be paginated (20/page)
      page.shouldHavePlacementListLengthOf(20)
      page.shouldHavePaginationControl()

      // When I select the 'historical' tab
      page.clickTab('Historical')

      // Then the 'historical' tab should be selected
      page.shouldHaveActiveTab('Historical')

      // And it should be paginated (20/page)
      page.shouldHavePlacementListLengthOf(20)
      page.shouldHavePaginationControl()
    })

    it('should let the user filter by keyworker', () => {
      const testKeyworker = keyworkers[2]
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

      // When I visit premises details page and select the upcoming tab
      const page = PremisesShowPage.visit(premises)
      page.clickTab('Upcoming')

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
      page.clickTab('Search for a booking')

      // Then the 'search' tab should be selected
      page.shouldHaveActiveTab('Search for a booking')

      // And I should see the search form
      page.shouldShowSearchForm()

      // And I should not see the results list
      page.shouldNotShowPlacementsResultsTable()

      // When I submit a search using the form
      page.searchByCrnOrName(searchName)

      // Then the 'search' tab should be selected
      page.shouldHaveActiveTab('Search for a booking')

      // And the search form should be populated with my search term
      page.shouldShowSearchForm(searchName)

      // And I should see the results
      page.shouldShowListOfPlacements(searchResults)

      // When I search for a name that returns no results
      cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements: [] })
      page.searchByCrnOrName('No results for this query')

      // Then the 'search' tab should be selected
      page.shouldHaveActiveTab('Search for a booking')

      // And the search form should be populated with my search term
      page.shouldShowSearchForm('No results for this query')

      // Then I should see a message that there are no results
      page.shouldShowNoResults()
    })

    it('should not show the placements section if space bookings are not enabled for the premises', () => {
      // Given there is a premises in the database that does not support space bookings
      const premisesSpaceBookingsDisabled = cas1PremisesFactory.build({ supportsSpaceBookings: false })
      cy.task('stubSinglePremises', premisesSpaceBookingsDisabled)

      // When I visit premises details page
      const page = PremisesShowPage.visit(premisesSpaceBookingsDisabled)

      // Then I should not see the placements section
      page.shouldNotShowPlacementsSection()
    })

    it('should show the overbooking banner if the premises is overbooked', () => {
      // Given there is a premises that is overbooked in the next 12 weeks
      const overbooking = {
        overbookingSummary: PremisesShowPage.overbookingSummary,
      }
      cy.task('stubSinglePremises', { ...premises, ...overbooking })

      // When I visit premises details page
      const page = PremisesShowPage.visit(premises)

      // Then I should see the overbooking banner
      page.shouldShowOverbookingSummary()
    })

    it('should not show the overbooking banner if the premises is not overbooked', () => {
      // Given there is a premises that is not overbooked in the next 12 weeks
      cy.task('stubSinglePremises', { ...premises, overbookingSummary: [] })

      // When I visit premises details page
      const page = PremisesShowPage.visit(premises)

      // Then I should see the overbooking banner
      page.shouldNotShowBanner()
    })
  })

  describe('beds', () => {
    const premisesId = 'premisesId'
    const bedSummaries = [
      ...cas1PremisesBedSummaryFactory.buildList(4),
      cas1PremisesBedSummaryFactory.build({ characteristics: [] }),
    ]
    const bedDetail = cas1BedDetailFactory.build({ ...bedSummaries[0], name: bedSummaries[1].bedName })
    const premises = cas1PremisesFactory.build({ id: premisesId })

    beforeEach(() => {
      cy.task('reset')

      // Given there are beds in the database
      cy.task('stubBeds', { premisesId, bedSummaries })
      cy.task('stubBed', { premisesId, bedDetail })
      cy.task('stubSinglePremises', premises)
    })

    it('should allow me to visit a bed from the bed list page', () => {
      // Given I am signed in as a future manager
      signIn('future_manager')

      // When I visit the beds page
      const bedsPage = BedsListPage.visit(premisesId)

      // Then I should see all of the beds listed
      bedsPage.shouldShowBeds(bedSummaries, premisesId)

      // And I should have a link to view all of this premises' out-of-service beds
      bedsPage.shouldIncludeLinkToAllPremisesOutOfServiceBeds(premisesId)

      // When I filter the beds
      bedsPage.filterBeds()

      // Then I should see a reduced list of beds
      bedsPage.shouldShowBeds(
        bedSummaries.filter(({ characteristics }) => characteristics.includes('isStepFreeDesignated')),
        premisesId,
      )

      // When I click on a bed
      bedsPage.clickBed(bedDetail)

      // Then I should be taken to the bed page
      Page.verifyOnPage(BedShowPage, bedDetail.name)

      // Given I'm on the bed page
      const bedPage = BedShowPage.visit(premisesId, bedDetail)

      // Then I should see the room details
      bedPage.shouldShowBedDetails(bedDetail)

      // And I should see a link to the premises
      bedPage.shouldLinkToPremises(premises)
    })
  })
})
