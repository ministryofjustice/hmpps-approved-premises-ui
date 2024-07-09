import {
  bedDetailFactory,
  bookingFactory,
  extendedPremisesSummaryFactory,
  outOfServiceBedFactory,
  outOfServiceBedRevisionFactory,
  premisesFactory,
} from '../../../server/testutils/factories'
import { sortOutOfServiceBedRevisionsByUpdatedAt } from '../../../server/utils/outOfServiceBedUtils'
import { OutOfServiceBedCreatePage, OutOfServiceBedShowPage } from '../../pages/v2Manage/outOfServiceBeds'
import BedShowPage from '../../pages/v2Manage/bed/bedShow'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('OutOfServiceBeds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')
  })

  it('should allow me to create an out of service bed', () => {
    const premises = extendedPremisesSummaryFactory.build()
    cy.task('stubPremisesSummary', premises)

    const outOfServiceBed = outOfServiceBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubOutOfServiceBedCreate', { premisesId: premises.id, outOfServiceBed })

    // stub ultimate API call when redirecting to bed page
    const bedDetail = bedDetailFactory.build({ id: outOfServiceBed.bed.id })
    cy.task('stubBed', { premisesId: premises.id, bedDetail })

    // Given I am signed in as a future manager
    signIn(['future_manager'])

    // When I navigate to the out of service bed form
    const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bed.id)

    // And I fill out the form
    page.completeForm(outOfServiceBed)
    page.clickSubmit()

    // Then a POST to the API should be made to create the OOSB record
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
      expect(requestBody.reason).equal(outOfServiceBed.reason.id)
    })

    // And I should be redirected to the v2 bed page
    const v2BedPage = Page.verifyOnPage(BedShowPage)

    // And I should see the confirmation message
    v2BedPage.shouldShowBanner('The out of service bed has been recorded')
  })

  it('should show errors', () => {
    // Given I am signed in as a future manager
    signIn(['future_manager'])

    // And a out of service bed is available
    const premises = premisesFactory.build()

    // When I navigate to the out of service bed form
    const page = OutOfServiceBedCreatePage.visit(premises.id, 'bedId')

    // And I have errors on validated fields
    cy.task('stubOutOfServiceBedErrors', {
      premisesId: premises.id,
      params: ['startDate', 'endDate', 'reason', 'notes'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'reason', 'notes'])
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
})
