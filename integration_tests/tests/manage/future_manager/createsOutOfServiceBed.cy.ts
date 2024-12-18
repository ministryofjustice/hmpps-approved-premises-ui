import {
  bedDetailFactory,
  cas1PremisesSummaryFactory,
  extendedPremisesSummaryFactory,
  outOfServiceBedFactory,
  premisesFactory,
} from '../../../../server/testutils/factories'
import BedShowPage from '../../../pages/manage/bed/bedShow'
import Page from '../../../pages/page'
import { OutOfServiceBedCreatePage } from '../../../pages/manage/outOfServiceBeds'
import { signIn } from '../../signIn'

context('OutOfServiceBeds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')
  })

  it('should allow me to create an out of service bed', () => {
    const bedName = '12 - 2'
    const premises = cas1PremisesSummaryFactory.build()
    cy.task('stubSinglePremises', premises)

    const outOfServiceBed = outOfServiceBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubOutOfServiceBedCreate', { premisesId: premises.id, outOfServiceBed })

    // stub ultimate API call when redirecting to bed page
    const bedDetail = bedDetailFactory.build({ id: outOfServiceBed.bed.id, name: bedName })
    cy.task('stubBed', { premisesId: premises.id, bedDetail })

    // Given I am signed in with permissions to view and create out of service beds
    signIn([], ['cas1_premises_view', 'cas1_out_of_service_bed_create', 'cas1_view_out_of_service_beds'])

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

    // And I should be redirected to the bed page
    const bedPage = Page.verifyOnPage(BedShowPage, bedName)

    // And I should see the confirmation message
    bedPage.shouldShowBanner('The out of service bed has been recorded')
  })

  it('should show errors', () => {
    // Given I am signed in with permission to create an out of service bed
    signIn([], ['cas1_out_of_service_bed_create'])

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

  it('should show an error when there are out of service bed conflicts', () => {
    // Given I am signed in with permission to create an out of service bed
    signIn([], ['cas1_out_of_service_bed_create', 'cas1_view_out_of_service_beds'])

    const bed = { name: 'abc', id: '123' }
    const premises = extendedPremisesSummaryFactory.build()
    const conflictingOutOfServiceBed = outOfServiceBedFactory.build({
      bed,
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })

    cy.task('stubPremisesSummary', premises)
    cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed: conflictingOutOfServiceBed })
    const bedDetail = bedDetailFactory.build({ id: bed.id })
    cy.task('stubBed', { premisesId: premises.id, bedDetail })

    // When I navigate to the out of service bed form
    const outOfServiceBed = outOfServiceBedFactory.build({
      bed,
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubOutOfServiceBedConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingOutOfServiceBed.id,
      conflictingEntityType: 'lost-bed',
    })

    const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bed.id)

    // And I fill out the form
    page.completeForm(outOfServiceBed)
    page.clickSubmit()

    // Then I should see an error message
    page.shouldShowDateConflictErrorMessages(conflictingOutOfServiceBed, 'lost-bed')
  })
})
