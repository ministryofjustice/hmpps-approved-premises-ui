import DashboardPage from '../../pages/dashboard'
import {
  bookingFactory,
  extendedPremisesSummaryFactory,
  outOfServiceBedCancellationFactory,
  outOfServiceBedFactory,
  premisesFactory,
} from '../../../server/testutils/factories'

import {
  OutOfServiceBedCreatePage,
  OutOfServiceBedListPage,
  OutOfServiceBedShowPage,
} from '../../pages/manage/outOfServiceBeds'
import Page from '../../pages/page'
import { signIn } from '../signIn'
import { OutOfServiceBedIndexPage } from '../../pages/v2Manage/outOfServiceBeds'

context('OutOfServiceBeds', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a future manager
    signIn(['future_manager'])
  })

  it('should allow me to create a out of service bed', () => {
    const premises = extendedPremisesSummaryFactory.build()
    cy.task('stubPremisesSummary', premises)

    // When I navigate to the out of service bed form

    const outOfServiceBed = outOfServiceBedFactory.build({
      outOfServiceFrom: '2022-02-11',
      outOfServiceTo: '2022-03-11',
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

      expect(requestBody.outOfServiceFrom).equal(outOfServiceBed.outOfServiceFrom)
      expect(requestBody.outOfServiceTo).equal(outOfServiceBed.outOfServiceTo)
      expect(requestBody.notes).equal(outOfServiceBed.notes)
      expect(requestBody.referenceNumber).equal(outOfServiceBed.referenceNumber)
    })

    // And I should be navigated to the premises detail page and see the confirmation message
    page.shouldShowBanner('Out of service bed logged')
  })

  it('should show errors', () => {
    // And a out of service bed is available
    const premises = premisesFactory.build()

    // When I navigate to the out of service bed form
    const page = OutOfServiceBedCreatePage.visit(premises.id, 'bedId')

    // And I miss required fields
    cy.task('stubOutOfServiceBedErrors', {
      premisesId: premises.id,
      params: ['outOfServiceFrom', 'outOfServiceTo', 'referenceNumber'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['outOfServiceFrom', 'outOfServiceTo', 'referenceNumber'])
  })

  it('should show an error when there are booking conflicts', () => {
    const premises = extendedPremisesSummaryFactory.build()
    const conflictingBooking = bookingFactory.build()
    cy.task('stubPremisesSummary', premises)
    cy.task('stubBookingGet', { premisesId: premises.id, booking: conflictingBooking })

    // When I navigate to the out of service bed form

    const outOfServiceBed = outOfServiceBedFactory.build({
      outOfServiceFrom: '2022-02-11',
      outOfServiceTo: '2022-03-11',
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

  it('should show a out of service bed', () => {
    // And I have created a out of service bed
    const premises = premisesFactory.build()
    const outOfServiceBed = outOfServiceBedFactory.build()

    cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })

    // And I visit that out of service bed's show page
    const page = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

    // Then I should see the details of that out of service bed
    page.shouldShowOutOfServiceBedDetail()
  })

  describe('managing out of service beds', () => {
    it('should allow me to update an out of service bed', () => {
      const premisesId = 'premisesId'

      // And there is a out of service bed in the database
      const outOfServiceBed = outOfServiceBedFactory.build()
      cy.task('stubOutOfServiceBed', { premisesId, outOfServiceBed })
      cy.task('stubOutOfServiceBedsListForAPremises', { premisesId, outOfServiceBeds: [outOfServiceBed] })
      cy.task('stubOutOfServiceBedUpdate', { premisesId, outOfServiceBed })

      // When I visit the out of service bed index page
      const outOfServiceBedListPage = OutOfServiceBedListPage.visit(premisesId)

      // Then I see the out of service beds for that premises
      outOfServiceBedListPage.shouldShowOutOfServiceBeds([outOfServiceBed])

      // // When I click manage on a bed
      outOfServiceBedListPage.clickManageBed(outOfServiceBed)

      // // Then I should see the out of service bed manage form
      const outOfServiceBedShowPage = Page.verifyOnPage(OutOfServiceBedShowPage, outOfServiceBed)
      outOfServiceBedShowPage.shouldShowOutOfServiceBedDetail()

      // // When I fill in the form and submit
      const newOutOfServiceTo = '2023-10-12'
      const newNote = 'example'
      outOfServiceBedShowPage.completeForm(newOutOfServiceTo, newNote)
      outOfServiceBedShowPage.clickSubmit()

      // // Then I am taken back to the list of out of service beds
      Page.verifyOnPage(OutOfServiceBedListPage)

      // // Then a out of service bed should have been updated in the API
      cy.task('verifyOutOfServiceBedUpdate', {
        premisesId,
        outOfServiceBed,
      }).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)

        expect(requestBody.outOfServiceFrom).equal(outOfServiceBed.outOfServiceFrom)
        expect(requestBody.outOfServiceTo).equal(newOutOfServiceTo)
        expect(requestBody.notes).equal(newNote)
        expect(requestBody.referenceNumber).equal(outOfServiceBed.referenceNumber)
      })

      // // And I should be navigated to the premises detail page and see the confirmation message
      outOfServiceBedShowPage.shouldShowBanner('Bed updated')
    })

    it('should show an error when there are validation errors', () => {
      const premisesId = 'premisesId'

      // And there is a out of service bed in the database
      const outOfServiceBed = outOfServiceBedFactory.build()
      cy.task('stubOutOfServiceBed', { premisesId, outOfServiceBed })
      cy.task('stubOutOfServiceBedsListForAPremises', { premisesId, outOfServiceBeds: [outOfServiceBed] })

      // And I miss required fields
      cy.task('stubUpdateOutOfServiceBedErrors', {
        outOfServiceBed,
        premisesId,
        params: [
          {
            propertyName: `$.outOfServiceTo`,
            errorType: 'empty',
          },
        ],
      })

      // When I visit the out of service bed show page
      const outOfServiceBedShowPage = OutOfServiceBedShowPage.visit(premisesId, outOfServiceBed)
      outOfServiceBedShowPage.shouldShowOutOfServiceBedDetail()

      // When I try to submit
      outOfServiceBedShowPage.clickSubmit()

      // Then I should see an error message
      outOfServiceBedShowPage.shouldShowErrorMessagesForFields(['outOfServiceTo'])
    })

    it('should allow me to cancel a out of service bed', () => {
      const premisesId = 'premisesId'

      // And there is a out of service bed in the database
      const outOfServiceBed = outOfServiceBedFactory.build()
      const outOfServiceBedCancellation = outOfServiceBedCancellationFactory.build()
      cy.task('stubOutOfServiceBed', { premisesId, outOfServiceBed })
      cy.task('stubOutOfServiceBedsListForAPremises', { premisesId, outOfServiceBeds: [outOfServiceBed] })
      cy.task('stubCancelOutOfServiceBed', {
        premisesId,
        outOfServiceBedId: outOfServiceBed.id,
        outOfServiceBedCancellation,
      })

      // Given I visit the out of service bed show page
      const outOfServiceBedShowPage = OutOfServiceBedShowPage.visit(premisesId, outOfServiceBed)

      // When I try to submit
      outOfServiceBedShowPage.clickCancel()

      cy.task('verifyOutOfServiceBedCancel', {
        premisesId,
        outOfServiceBedId: outOfServiceBed.id,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // Then I am redirected to the out of service bed list page and see the confirmation message
      const listPage = Page.verifyOnPage(OutOfServiceBedListPage)
      listPage.shouldShowBanner('Bed cancelled')
    })
  })

  describe('list of all OOS beds', () => {
    const outOfServiceBeds = outOfServiceBedFactory.buildList(3)

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
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: '1' })
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: '2' })
      cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: '9' })

      // When I visit the OOS beds index page
      const page = OutOfServiceBedIndexPage.visit('current')

      // And I click next
      page.clickNext()

      // Then the API should have received a request for the next page
      cy.task('verifyOutOfServiceBedsDashboard', { page: '2' }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // When I click on a page number
      page.clickPageNumber('9')

      // Then the API should have received a request for the that page number
      cy.task('verifyOutOfServiceBedsDashboard', { page: '9' }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })

    it('allows me to filter by temporality', () => {
      const futureBeds = outOfServiceBedFactory.buildList(3)
      const historicBeds = outOfServiceBedFactory.buildList(3)

      cy.task('stubOutOfServiceBedsList', {
        outOfServiceBeds,
        page: '1',
        temporality: 'current',
      })
      cy.task('stubOutOfServiceBedsList', {
        outOfServiceBeds: futureBeds,
        page: '1',
        temporality: 'future',
      })
      cy.task('stubOutOfServiceBedsList', {
        outOfServiceBeds: historicBeds,
        page: '1',
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

    it('supports sorting by outOfServiceFrom', () => {
      shouldSortByField('outOfServiceFrom')
    })

    it('supports sorting by outOfServiceTo', () => {
      shouldSortByField('outOfServiceTo')
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
      page: '1',
      sortBy: field,
      sortDirection: 'asc',
      temporality: 'current',
    })
    cy.task('stubOutOfServiceBedsList', {
      outOfServiceBeds,
      page: '1',
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
    cy.task('verifyOutOfServiceBedsDashboard', { page: '1', sortBy: field, sortDirection: 'asc' }).then(requests => {
      expect(requests).to.have.length(field === 'outOfServiceFrom' ? 2 : 1)
    })

    // And the page should show the sorted items
    page.shouldBeSortedByField(field, 'ascending')

    // When I click the sort button again
    page.clickSortBy(field)

    // Then the API should have received a request for the sort
    cy.task('verifyOutOfServiceBedsDashboard', { page: '1', sortBy: field, sortDirection: 'desc' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And the page should show the sorted items
    page.shouldBeSortedByField(field, 'descending')
  }
})
