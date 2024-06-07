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
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubOutOfServiceBedCreate', { premisesId: premises.id, outOfServiceBed })

    const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bedId)

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

    const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bedId)

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
      cy.task('stubOutOfServiceBedsList', { premisesId, outOfServiceBeds: [outOfServiceBed] })
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
      const newEndDate = '2023-10-12'
      const newNote = 'example'
      outOfServiceBedShowPage.completeForm(newEndDate, newNote)
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

        expect(requestBody.startDate).equal(outOfServiceBed.startDate)
        expect(requestBody.endDate).equal(newEndDate)
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
      cy.task('stubOutOfServiceBedsList', { premisesId, outOfServiceBeds: [outOfServiceBed] })

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
      outOfServiceBedShowPage.shouldShowErrorMessagesForFields(['endDate'])
    })

    it('should allow me to cancel a out of service bed', () => {
      const premisesId = 'premisesId'

      // And there is a out of service bed in the database
      const outOfServiceBed = outOfServiceBedFactory.build()
      const outOfServiceBedCancellation = outOfServiceBedCancellationFactory.build()
      cy.task('stubOutOfServiceBed', { premisesId, outOfServiceBed })
      cy.task('stubOutOfServiceBedsList', { premisesId, outOfServiceBeds: [outOfServiceBed] })
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
})
