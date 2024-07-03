import DashboardPage from '../../pages/dashboard'
import {
  bedDetailFactory,
  bookingFactory,
  extendedPremisesSummaryFactory,
  outOfServiceBedFactory,
  outOfServiceBedRevisionFactory,
  premisesFactory,
} from '../../../server/testutils/factories'
import { sortOutOfServiceBedRevisionsByUpdatedAt } from '../../../server/utils/outOfServiceBedUtils'
import {
  OutOfServiceBedCreatePage,
  OutOfServiceBedIndexPage,
  OutOfServiceBedShowPage,
} from '../../pages/v2Manage/outOfServiceBeds'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('OutOfServiceBeds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')
  })

  it('should allow me to create a out of service bed', () => {
    const premises = extendedPremisesSummaryFactory.build()
    cy.task('stubPremisesSummary', premises)
    const fullPremises = premisesFactory.build({ id: premises.id })
    cy.task('stubSinglePremises', fullPremises)

    // Given I am signed in as a future manager
    signIn(['future_manager'])

    // When I navigate to the out of service bed form
    const outOfServiceBed = outOfServiceBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubOutOfServiceBedCreate', { premisesId: premises.id, outOfServiceBed })

    const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bed.id)

    // And I fill out the form
    page.completeForm(outOfServiceBed)
    page.clickSubmit()

    // Then a out of service bed should have been created in the API
    cy.task('verifyOutOfServiceBedCreate', {
      premisesId: premises.id,
      outOfServiceBed,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(outOfServiceBed.startDate)
      expect(requestBody.endDate).equal(outOfServiceBed.endDate)
      expect(requestBody.notes).equal(outOfServiceBed.notes)
      expect(requestBody.referenceNumber).equal(outOfServiceBed.referenceNumber)
    })

    // And I should be navigated to the premises detail page and see the confirmation message
    page.shouldShowBanner('Out of service bed logged')
  })

  it('should show errors', () => {
    // Given I am signed in as a future manager
    signIn(['future_manager'])

    // And a out of service bed is available
    const premises = premisesFactory.build()

    // When I navigate to the out of service bed form
    const page = OutOfServiceBedCreatePage.visit(premises.id, 'bedId')

    // And I miss required fields
    cy.task('stubOutOfServiceBedErrors', {
      premisesId: premises.id,
      params: ['startDate', 'endDate', 'referenceNumber'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'referenceNumber'])
  })

  it('should show an error when there are booking conflicts', () => {
    // Given I am signed in as a future manager
    signIn(['future_manager'])

    const premises = extendedPremisesSummaryFactory.build()
    const conflictingBooking = bookingFactory.build()
    cy.task('stubPremisesSummary', premises)
    cy.task('stubBookingGet', { premisesId: premises.id, booking: conflictingBooking })

    // When I navigate to the out of service bed form

    const outOfServiceBed = outOfServiceBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubOutOfServiceBedConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingBooking.id,
      conflictingEntityType: 'booking',
    })

    const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bed.id)

    // And I fill out the form
    page.completeForm(outOfServiceBed)
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowDateConflictErrorMessages(conflictingBooking, 'booking')
  })

  describe('for a new out of service bed with all nullable fields present in the initial OoS bed revision', () => {
    it('should show a out of service bed', () => {
      // Given I am signed in as a future manager
      signIn(['future_manager'])

      // And I have created a out of service bed
      const bed = { name: 'abc', id: '123' }
      const premises = premisesFactory.build()
      const outOfServiceBed = outOfServiceBedFactory.build({ bed })
      outOfServiceBed.revisionHistory = sortOutOfServiceBedRevisionsByUpdatedAt(outOfServiceBed.revisionHistory)
      const bedDetail = bedDetailFactory.build({ id: bed.id })

      cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })

      // And I visit that out of service bed's show page
      const page = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

      // Then I should see the latest details of that out of service bed
      page.shouldShowOutOfServiceBedDetail()

      // And I should see the bed characteristics
      page.shouldShowCharacteristics(bedDetail)

      // When I click the 'Timeline' tab
      page.clickTab('Timeline')

      // Then I should see the timeline of that out of service bed's revision
      page.shouldShowTimeline()
    })
  })

  describe('for a legacy "lost bed" records migrated with all nullable fields not present in the initial OoS bed revision', () => {
    it('should show a out of service bed', () => {
      // Given I am signed in as a future manager
      signIn(['future_manager'])

      // And I have created a out of service bed
      const bed = { name: 'abc', id: '123' }
      const premises = premisesFactory.build()
      const outOfServiceBedRevision = outOfServiceBedRevisionFactory.build({
        updatedBy: undefined,
        startDate: undefined,
        endDate: undefined,
        reason: undefined,
        referenceNumber: undefined,
        notes: undefined,
      })
      const outOfServiceBed = outOfServiceBedFactory.build({
        bed,
        revisionHistory: [outOfServiceBedRevision],
      })
      const bedDetail = bedDetailFactory.build({ id: bed.id })

      cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })

      // And I visit that out of service bed's show page
      const page = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

      // When I click the 'Timeline' tab
      page.clickTab('Timeline')

      // Then I should see the timeline of that out of service bed's revision
      page.shouldShowTimeline()
    })
  })

  describe('CRU Member lists all OOS beds', () => {
    beforeEach(() => {
      cy.task('reset')
      // Given I am signed in as a CRU Member
      signIn(['cru_member'])
    })

    const outOfServiceBeds = outOfServiceBedFactory.buildList(10)

    it('allows me to view all out of service beds', () => {
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1 })
      // Given I am on the dashboard
      const dashboardPage = DashboardPage.visit()

      // When I click the 'Out of service beds' tile
      dashboardPage.shouldShowCard('outOfServiceBeds')
      cy.get('a').contains('View out of service beds').click()

      // Then I should be taken to the out of service beds index page
      const page = Page.verifyOnPage(OutOfServiceBedIndexPage)

      // And I should see a list of currently out of service beds
      page.shouldShowOutOfServiceBeds(outOfServiceBeds)
    })

    it('supports pagination', () => {
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1 })
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 2 })
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 9 })

      // When I visit the OOS beds index page
      const page = OutOfServiceBedIndexPage.visit('current')

      // And I click next
      page.clickNext()

      // Then the API should have received a request for the next page
      cy.task('verifyOutOfServiceBedsDashboard', { page: 2, temporality: 'current' }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // When I click on a page number
      page.clickPageNumber('9')

      // Then the API should have received a request for the that page number
      cy.task('verifyOutOfServiceBedsDashboard', { page: 9, temporality: 'current' }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })

    it('allows me to filter by temporality', () => {
      const futureBeds = outOfServiceBedFactory.buildList(3)
      const historicBeds = outOfServiceBedFactory.buildList(3)

      cy.task('stubOutOfServiceBedsList', {
        outOfServiceBeds,
        page: 1,
        temporality: 'current',
      })
      cy.task('stubOutOfServiceBedsList', {
        outOfServiceBeds: futureBeds,
        page: 1,
        temporality: 'future',
      })
      cy.task('stubOutOfServiceBedsList', {
        outOfServiceBeds: historicBeds,
        page: 1,
        temporality: 'historic',
      })

      // Given I'm on the out of service beds index page
      const page = OutOfServiceBedIndexPage.visit('current')

      // When I click the 'future' tab
      page.clickTab('Future')

      // Then I see a list of future out of service beds
      page.shouldShowOutOfServiceBeds(futureBeds)

      // And when I click the 'historic' tab
      page.clickTab('Historic')

      // Then I see a list of historic out of service beds
      page.shouldShowOutOfServiceBeds(historicBeds)
    })

    it('supports sorting by premisesName', () => {
      shouldSortByField('premisesName')
    })

    it('supports sorting by roomName', () => {
      shouldSortByField('roomName')
    })

    it('supports sorting by bedName', () => {
      shouldSortByField('bedName')
    })

    it('supports sorting by startDate', () => {
      shouldSortByField('startDate')
    })

    it('supports sorting by endDate', () => {
      shouldSortByField('endDate')
    })

    it('supports sorting by reason', () => {
      shouldSortByField('reason')
    })

    it('supports sorting by daysLost', () => {
      shouldSortByField('daysLost')
    })
  })

  const shouldSortByField = (field: string) => {
    // And there is a page of out of service beds
    const outOfServiceBeds = outOfServiceBedFactory.buildList(5)

    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1 })
    cy.task('stubOutOfServiceBedsList', {
      outOfServiceBeds,
      page: 1,
      sortBy: field,
      sortDirection: 'asc',
      temporality: 'current',
    })
    cy.task('stubOutOfServiceBedsList', {
      outOfServiceBeds,
      page: 1,
      sortBy: field,
      sortDirection: 'desc',
      temporality: 'current',
    })

    // When I access the out of service beds dashboard
    const page = OutOfServiceBedIndexPage.visit('current')

    // Then I should see the first result
    page.shouldShowOutOfServiceBeds(outOfServiceBeds)

    // When I click the column to sort by
    page.clickSortBy(field)

    // Then the API should have received a request for the sort
    cy.task('verifyOutOfServiceBedsDashboard', {
      page: 1,
      sortBy: field,
      temporality: 'current',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And the page should show the sorted items
    page.shouldBeSortedByField(field, 'ascending')

    // When I click the sort button again
    page.clickSortBy(field)

    // Then the API should have received a request for the sort
    cy.task('verifyOutOfServiceBedsDashboard', {
      page: 1,
      sortBy: field,
      sortDirection: 'desc',
      temporality: 'current',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And the page should show the sorted items
    page.shouldBeSortedByField(field, 'descending')
  }
})
