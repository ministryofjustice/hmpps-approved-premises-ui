import {
  bookingFactory,
  extendedPremisesSummaryFactory,
  lostBedCancellationFactory,
  lostBedFactory,
  premisesFactory,
} from '../../../server/testutils/factories'

import { LostBedCreatePage, LostBedListPage, LostBedShowPage } from '../../pages/manage'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('LostBed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLostBedReferenceData')

    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])
  })

  it('should allow me to create a lost bed', () => {
    const premises = extendedPremisesSummaryFactory.build()
    cy.task('stubPremisesSummary', premises)

    // When I navigate to the lost bed form

    const lostBed = lostBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubLostBedCreate', { premisesId: premises.id, lostBed })

    const page = LostBedCreatePage.visit(premises.id, lostBed.bedId)

    // And I fill out the form
    page.completeForm(lostBed)
    page.clickSubmit()

    // Then a lost bed should have been created in the API
    cy.task('verifyLostBedCreate', {
      premisesId: premises.id,
      lostBed,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(lostBed.startDate)
      expect(requestBody.endDate).equal(lostBed.endDate)
      expect(requestBody.notes).equal(lostBed.notes)
      expect(requestBody.reason).equal(lostBed.reason.id)
      expect(requestBody.referenceNumber).equal(lostBed.referenceNumber)
    })

    // And I should be navigated to the premises detail page and see the confirmation message
    page.shouldShowBanner('Lost bed logged')
  })

  it('should show errors', () => {
    // And a lost bed is available
    const premises = premisesFactory.build()

    // When I navigate to the lost bed form
    const page = LostBedCreatePage.visit(premises.id, 'bedId')

    // And I miss required fields
    cy.task('stubLostBedErrors', {
      premisesId: premises.id,
      params: ['startDate', 'endDate', 'reason', 'referenceNumber'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'reason', 'referenceNumber'])
  })

  it('should show an error when there are booking conflicts', () => {
    const premises = extendedPremisesSummaryFactory.build()
    const conflictingBooking = bookingFactory.build()
    cy.task('stubPremisesSummary', premises)
    cy.task('stubBookingGet', { premisesId: premises.id, booking: conflictingBooking })

    // When I navigate to the lost bed form

    const lostBed = lostBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubLostBedConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingBooking.id,
      conflictingEntityType: 'booking',
    })

    const page = LostBedCreatePage.visit(premises.id, lostBed.bedId)

    // And I fill out the form
    page.completeForm(lostBed)
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowDateConflictErrorMessages(conflictingBooking, 'booking')
  })

  it('should show a lost bed', () => {
    // And I have created a lost bed
    const premises = premisesFactory.build()
    const lostBed = lostBedFactory.build()

    cy.task('stubLostBed', { premisesId: premises.id, lostBed })

    // And I visit that lost bed's show page
    const page = LostBedShowPage.visit(premises.id, lostBed)

    // Then I should see the details of that lost bed
    page.shouldShowLostBedDetail()
  })

  describe('managing lost beds', () => {
    it('should allow me to update a lost bed', () => {
      const premisesId = 'premisesId'

      // And there is a lost bed in the database
      const lostBed = lostBedFactory.build()
      cy.task('stubLostBed', { premisesId, lostBed })
      cy.task('stubLostBedsList', { premisesId, lostBeds: [lostBed] })
      cy.task('stubLostBedUpdate', { premisesId, lostBed })

      // When I visit the Lost Bed index page
      const lostBedListPage = LostBedListPage.visit(premisesId)

      // Then I see the lost beds for that premises
      lostBedListPage.shouldShowLostBeds([lostBed])

      // When I click manage on a bed
      lostBedListPage.clickManageBed(lostBed)

      // Then I should see the out of service bed manage form
      Page.verifyOnPage(LostBedShowPage)
      const lostBedShowPage = LostBedShowPage.visit(premisesId, lostBed)
      lostBedShowPage.shouldShowLostBedDetail()

      // When I fill in the form and submit
      const newEndDate = '2023-10-12'
      const newNote = 'example'
      lostBedShowPage.completeForm(newEndDate, newNote)
      lostBedShowPage.clickSubmit()

      // Then I am taken back to the list of out of service beds
      Page.verifyOnPage(LostBedListPage)

      // Then a lost bed should have been updated in the API
      cy.task('verifyLostBedUpdate', {
        premisesId,
        lostBed,
      }).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)

        expect(requestBody.startDate).equal(lostBed.startDate)
        expect(requestBody.endDate).equal(newEndDate)
        expect(requestBody.notes).equal(newNote)
        expect(requestBody.reason).equal(lostBed.reason.id)
        expect(requestBody.referenceNumber).equal(lostBed.referenceNumber)
      })

      // And I should be navigated to the premises detail page and see the confirmation message
      lostBedShowPage.shouldShowBanner('Bed updated')
    })

    it('should show an error when there are validation errors', () => {
      const premisesId = 'premisesId'

      // And there is a lost bed in the database
      const lostBed = lostBedFactory.build()
      cy.task('stubLostBed', { premisesId, lostBed })
      cy.task('stubLostBedsList', { premisesId, lostBeds: [lostBed] })

      // And I miss required fields
      cy.task('stubLostBedUpdateErrors', {
        lostBed,
        premisesId,
        params: ['endDate'],
      })

      // When I visit the Lost Bed show page
      const lostBedShowPage = LostBedShowPage.visit(premisesId, lostBed)
      lostBedShowPage.shouldShowLostBedDetail()

      // When I try to submit
      lostBedShowPage.clickSubmit()

      // Then I should see an error message
      lostBedShowPage.shouldShowErrorMessagesForFields(['endDate'])
    })

    it('should allow me to cancel a lost bed', () => {
      const premisesId = 'premisesId'

      // And there is a lost bed in the database
      const lostBed = lostBedFactory.build()
      const lostBedCancellation = lostBedCancellationFactory.build()
      cy.task('stubLostBed', { premisesId, lostBed })
      cy.task('stubLostBedsList', { premisesId, lostBeds: [lostBed] })
      cy.task('stubCancelLostBed', { premisesId, lostBedId: lostBed.id, lostBedCancellation })

      // Given I visit the Lost Bed show page
      const lostBedShowPage = LostBedShowPage.visit(premisesId, lostBed)

      // When I try to submit
      lostBedShowPage.clickCancel()

      cy.task('verifyLostBedCancel', {
        premisesId,
        lostBedId: lostBed.id,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // Then I am redirected to the Lost Bed list page and see the confirmation message
      const listPage = Page.verifyOnPage(LostBedListPage)
      listPage.shouldShowBanner('Bed cancelled')
    })
  })
})
