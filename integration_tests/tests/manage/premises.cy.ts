import { PersonSummary } from '@approved-premises/api'
import {
  cas1BedDetailFactory,
  cas1CurrentKeyworkerFactory,
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
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

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

      GIVEN('I am signed in as a future manager')
      signIn('future_manager', { cruManagementArea: userCruArea })

      WHEN('I visit the premises page')
      const premisesListPage = PremisesListPage.visit()

      THEN("I should see premises in the user's CRU management area listed")
      premisesListPage.shouldHaveSelectText('selectedArea', userCruArea.name)
      premisesListPage.shouldShowPremises(userPremises)

      WHEN('I select a specific area')
      premisesListPage.filterPremisesByArea(filterCruArea.name)

      THEN('I should see the premises for the selected area')
      premisesListPage.shouldHaveSelectText('selectedArea', filterCruArea.name)
      premisesListPage.shouldShowPremises(filteredPremises)

      WHEN("I select 'All areas'")
      premisesListPage.filterPremisesByArea('All areas')

      THEN('I should see all premises')
      premisesListPage.shouldHaveSelectText('selectedArea', 'All areas')
      premisesListPage.shouldShowPremises(allPremises)
    })
  })

  describe('show', () => {
    const premises = cas1PremisesFactory.build()
    const placements = cas1SpaceBookingSummaryFactory.buildList(30)
    const currentKeyworkers = cas1CurrentKeyworkerFactory.buildList(5)

    beforeEach(() => {
      cy.task('reset')

      GIVEN('there is a premises in the database')
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesCurrentKeyworkers', { premisesId: premises.id, currentKeyworkers })

      // TODO: Remove Staff Members stub once new keyworker flow released (APS-2644)
      const keyworkers = staffMemberFactory.keyworker().buildList(5)
      cy.task('stubPremisesStaffMembers', { premisesId: premises.id, staffMembers: keyworkers })

      AND('it has a list of placements')
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

      GIVEN('I am signed in as a future manager')
      // TODO: change sign-in to simply 'future_manager' once new keyworker flow released (APS-2644)
      signIn('future_manager', { permissions: ['cas1_experimental_new_assign_keyworker_flow'] })
    })

    it('should show a single premises details page', () => {
      WHEN('I visit premises details page')
      const page = PremisesShowPage.visit(premises)

      THEN('I should see the premises details shown')
      page.shouldShowAPArea(premises.apArea.name)
      page.shouldShowPremisesDetail()

      AND('I should see the first page of placements for the premises')
      page.shouldHavePlacementListLengthOf(30)
      page.shouldShowListOfPlacements(placements.slice(0, 20))
    })

    it('should allow the user to change tab', () => {
      WHEN('I visit premises details page')
      const page = PremisesShowPage.visit(premises)

      THEN("the 'current' tab should be selected by default")
      page.shouldHaveActiveTab('Current')

      AND('it should show all 30 placements')
      page.shouldHavePlacementListLengthOf(30)

      WHEN("I select the 'upcoming' tab")
      page.clickTab('Upcoming')

      THEN("the 'current' tab should be selected")
      page.shouldHaveActiveTab('Upcoming')

      AND('it should be paginated (20/page)')
      page.shouldHavePlacementListLengthOf(20)
      page.shouldHavePaginationControl()

      WHEN("I select the 'historical' tab")
      page.clickTab('Historical')

      THEN("the 'historical' tab should be selected")
      page.shouldHaveActiveTab('Historical')

      AND('it should be paginated (20/page)')
      page.shouldHavePlacementListLengthOf(20)
      page.shouldHavePaginationControl()
    })

    it('should let the user filter by keyworker', () => {
      const testKeyworker = currentKeyworkers[2].summary
      const placementsWithKeyworker = cas1SpaceBookingSummaryFactory.buildList(6, {
        keyWorkerAllocation: cas1KeyworkerAllocationFactory.build({
          keyWorkerUser: testKeyworker,
        }),
      })
      cy.task('stubSpaceBookingSummaryList', {
        premisesId: premises.id,
        placements: placementsWithKeyworker,
        residency: 'upcoming',
        keyWorkerUserId: testKeyworker.id,
      })

      WHEN('I visit premises details page and select the upcoming tab')
      const page = PremisesShowPage.visit(premises)
      page.clickTab('Upcoming')

      WHEN('I filter the results by keyworker')
      page.selectKeyworker(testKeyworker.name)
      page.clickApplyFilter()

      THEN('I should see the form with the keyworker pre-selected')
      page.shouldHaveSelectText('keyworker', testKeyworker.name)

      AND('the results should be filtered')
      page.shouldShowListOfPlacements(placementsWithKeyworker)
      page.shouldShowInEveryTableRow(testKeyworker.name)

      WHEN("I clear the filter by selecting 'All keyworkers'")
      page.selectKeyworker('All keyworkers')
      page.clickApplyFilter()

      THEN('I should see the form with the keyworker pre-selected')
      page.shouldHaveSelectText('keyworker', 'All keyworkers')

      AND('all the results should be shown')
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

      WHEN('I visit premises details page')
      const page = PremisesShowPage.visit(premises)

      AND("I select to the 'search' tab")
      page.clickTab('Search for a booking')

      THEN("the 'search' tab should be selected")
      page.shouldHaveActiveTab('Search for a booking')

      AND('I should see the search form')
      page.shouldShowSearchForm()

      AND('I should not see the results list')
      page.shouldNotShowPlacementsResultsTable()

      WHEN('I submit a search using the form')
      page.searchByCrnOrName(searchName)

      THEN("the 'search' tab should be selected")
      page.shouldHaveActiveTab('Search for a booking')

      AND('the search form should be populated with my search term')
      page.shouldShowSearchForm(searchName)

      AND('I should see the results')
      page.shouldShowListOfPlacements(searchResults)

      WHEN('I search for a name that returns no results')
      cy.task('stubSpaceBookingSummaryList', { premisesId: premises.id, placements: [] })
      page.searchByCrnOrName('No results for this query')

      THEN("the 'search' tab should be selected")
      page.shouldHaveActiveTab('Search for a booking')

      AND('the search form should be populated with my search term')
      page.shouldShowSearchForm('No results for this query')

      THEN('I should see a message that there are no results')
      page.shouldShowNoResults()
    })

    it('should not show the placements section if space bookings are not enabled for the premises', () => {
      GIVEN('there is a premises in the database that does not support space bookings')
      const premisesSpaceBookingsDisabled = cas1PremisesFactory.build({ supportsSpaceBookings: false })
      cy.task('stubSinglePremises', premisesSpaceBookingsDisabled)

      WHEN('I visit premises details page')
      const page = PremisesShowPage.visit(premisesSpaceBookingsDisabled)

      THEN('I should not see the placements section')
      page.shouldNotShowPlacementsSection()
    })

    it('should show the overbooking banner if the premises is overbooked', () => {
      GIVEN('there is a premises that is overbooked in the next 12 weeks')
      const overbooking = {
        overbookingSummary: PremisesShowPage.overbookingSummary,
      }
      cy.task('stubSinglePremises', { ...premises, ...overbooking })

      WHEN('I visit premises details page')
      const page = PremisesShowPage.visit(premises)

      THEN('I should see the overbooking banner')
      page.shouldShowOverbookingSummary()
    })

    it('should not show the overbooking banner if the premises is not overbooked', () => {
      GIVEN('there is a premises that is not overbooked in the next 12 weeks')
      cy.task('stubSinglePremises', { ...premises, overbookingSummary: [] })

      WHEN('I visit premises details page')
      const page = PremisesShowPage.visit(premises)

      THEN('I should see the overbooking banner')
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

      GIVEN('there are beds in the database')
      cy.task('stubBeds', { premisesId, bedSummaries })
      cy.task('stubBed', { premisesId, bedDetail })
      cy.task('stubSinglePremises', premises)
    })

    it('should allow me to visit a bed from the bed list page', () => {
      GIVEN('I am signed in as a future manager')
      signIn('future_manager')

      WHEN('I visit the beds page')
      const bedsPage = BedsListPage.visit(premisesId)

      THEN('I should see all of the beds listed')
      bedsPage.shouldShowBeds(bedSummaries, premisesId)

      AND("I should have a link to view all of this premises' out-of-service beds")
      bedsPage.shouldIncludeLinkToAllPremisesOutOfServiceBeds(premisesId)

      WHEN('I filter the beds')
      bedsPage.filterBeds()

      THEN('I should see a reduced list of beds')
      bedsPage.shouldShowBeds(
        bedSummaries.filter(({ characteristics }) => characteristics.includes('isStepFreeDesignated')),
        premisesId,
      )

      WHEN('I click on a bed')
      bedsPage.clickBed(bedDetail)

      THEN('I should be taken to the bed page')
      Page.verifyOnPage(BedShowPage, bedDetail.name)

      GIVEN("I'm on the bed page")
      const bedPage = BedShowPage.visit(premisesId, bedDetail)

      THEN('I should see the room details')
      bedPage.shouldShowBedDetails(bedDetail)

      AND('I should see a link to the premises')
      bedPage.shouldLinkToPremises(premises)
    })
  })
})
