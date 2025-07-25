import { Cas1NewOutOfServiceBed, NamedId, UpdateCas1OutOfServiceBed } from '@approved-premises/api'
import {
  cas1BedDetailFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesFactory,
  outOfServiceBedFactory,
  outOfServiceBedRevisionFactory,
  premisesFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import {
  OutOfServiceBedCancelPage,
  OutOfServiceBedCreatePage,
  OutOfServiceBedPremisesIndexPage,
  OutOfServiceBedShowPage,
  OutOfServiceBedUpdatePage,
} from '../../pages/manage/outOfServiceBeds'
import { signIn } from '../signIn'
import { sortOutOfServiceBedRevisionsByUpdatedAt } from '../../../server/utils/outOfServiceBedUtils'
import paths from '../../../server/paths/api'
import BedShowPage from '../../pages/manage/bed/bedShow'

describe('Out of service beds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')

    // Given I am signed in as a Future manager
    signIn('future_manager')
  })

  it('allows me to view all out of service beds for a given premises', () => {
    const outOfServiceBeds = outOfServiceBedFactory.buildList(10)
    const premises = premisesFactory.build({ name: 'Hope House' })
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1, perPage: 50, premisesId: premises.id })
    cy.task('stubSinglePremises', premises)

    // Given I am on the out-of-service bed list for the premises
    OutOfServiceBedPremisesIndexPage.visit(premises)

    // Then I should see the list of out-of-service beds for the premises
    const page = Page.verifyOnPage(OutOfServiceBedPremisesIndexPage, premises)

    // And I should see the count of total results (not limited to page)
    page.hasCountOfAllResultsMatchingFilter()
  })

  describe('viewing an out of service bed record', () => {
    describe('for a new out of service bed with all nullable fields present in the initial OoS bed revision', () => {
      it('should show a out of service bed', () => {
        // And I have created a out of service bed
        const bed = { name: 'abc', id: '123' }
        const premises = premisesFactory.build()
        const outOfServiceBed = outOfServiceBedFactory.build({ bed })
        outOfServiceBed.revisionHistory = sortOutOfServiceBedRevisionsByUpdatedAt(outOfServiceBed.revisionHistory)
        const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

        cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
        cy.task('stubBed', { premisesId: premises.id, bedDetail })

        // And I visit that out of service bed's show page
        const page = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

        // Then I should see the latest details of that out of service bed
        page.shouldShowOutOfServiceBedDetail()

        // And I should see the bed characteristics
        page.shouldShowCharacteristics(bedDetail)

        // And I should see links to the premises and bed in the page heading
        page.shouldLinkToPremisesAndBed(outOfServiceBed)

        // When I click the 'Timeline' tab
        page.clickTab('Timeline')

        // Then I should see the timeline of that out of service bed's revision
        page.shouldShowTimeline()
      })
    })

    describe('for a legacy "lost bed" records migrated with all nullable fields not present in the initial OoS bed revision', () => {
      it('should show a out of service bed', () => {
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
        const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

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

  describe('creating an out of service bed record', () => {
    it('should allow me to create an out of service bed', () => {
      const bedName = '12 - 2'
      const premises = cas1PremisesFactory.build()
      cy.task('stubSinglePremises', premises)

      const outOfServiceBed = outOfServiceBedFactory.build({
        startDate: '2022-02-11',
        endDate: '2022-03-11',
      })
      cy.task('stubOutOfServiceBedCreate', { premisesId: premises.id, outOfServiceBed })

      // stub ultimate API call when redirecting to bed page
      const bedDetail = cas1BedDetailFactory.build({ id: outOfServiceBed.bed.id, name: bedName })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })

      // When I navigate to the out of service bed form
      const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bed.id)

      // And I fill out the form
      page.completeForm(outOfServiceBed)
      page.clickSubmit()

      // Then a POST to the API should be made to create the OOSB record
      cy.task('verifyApiPost', paths.manage.premises.outOfServiceBeds.create({ premisesId: premises.id })).then(
        (requestBody: Cas1NewOutOfServiceBed) => {
          expect(requestBody.startDate).equal(outOfServiceBed.startDate)
          expect(requestBody.endDate).equal(outOfServiceBed.endDate)
          expect(requestBody.notes).equal(outOfServiceBed.notes)
          expect(requestBody.referenceNumber).equal(outOfServiceBed.referenceNumber)
          expect(requestBody.reason).equal(outOfServiceBed.reason.id)
        },
      )

      // And I should be redirected to the bed page
      const bedPage = Page.verifyOnPage(BedShowPage, bedName)

      // And I should see the confirmation message
      bedPage.shouldShowBanner('The out of service bed has been recorded')
    })

    it('should show errors', () => {
      // And a out of service bed is available
      const premises = cas1PremisesFactory.build()

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
      const bed = { name: 'abc', id: '123' }
      const premises = cas1PremisesBasicSummaryFactory.build()
      const conflictingOutOfServiceBed = outOfServiceBedFactory.build({
        bed,
        startDate: '2022-02-11',
        endDate: '2022-03-11',
      })

      cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed: conflictingOutOfServiceBed })
      const bedDetail = cas1BedDetailFactory.build({ id: bed.id })
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

  describe('Updating an out of service bed', () => {
    it('should allow me to update an out of service bed', () => {
      const bed: NamedId = { name: 'bed', id: '123' }
      const premises = cas1PremisesBasicSummaryFactory.build()
      const outOfServiceBed = outOfServiceBedFactory.build({
        bed,
      })
      const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

      // Given I am viewing an out of service bed
      cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })
      const showPage = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

      // When I click 'Update record'
      showPage.clickAction('Update out of service bed')

      // Then I should be taken to the OoS bed update page
      const updatePage = Page.verifyOnPage(OutOfServiceBedUpdatePage, outOfServiceBed)

      // And it should show the details of the bed from the OoS bed record
      updatePage.shouldShowOutOfServiceBedDetails(outOfServiceBed)
      updatePage.formShouldBePrepopulated()

      // Given I want to update some details of the OoS bed
      cy.task('stubOutOfServiceBedUpdate', { premisesId: premises.id, outOfServiceBed })
      const updatedOutOfServiceBed = outOfServiceBedFactory.build({ id: outOfServiceBed.id, bed })

      // When I submit the form
      updatePage.completeForm(updatedOutOfServiceBed)
      updatePage.clickSubmit()

      // Then the update is sent to the API
      cy.task(
        'verifyApiPut',
        paths.manage.premises.outOfServiceBeds.update({ premisesId: premises.id, id: outOfServiceBed.id }),
      ).then(body => {
        const expectedBody: UpdateCas1OutOfServiceBed = {
          reason: updatedOutOfServiceBed.reason.id,
          notes: updatedOutOfServiceBed.notes,
          startDate: updatedOutOfServiceBed.startDate,
          endDate: updatedOutOfServiceBed.endDate,
        }

        if (updatedOutOfServiceBed.referenceNumber) {
          expectedBody.referenceNumber = updatedOutOfServiceBed.referenceNumber
        }

        expect(body).to.contain(expectedBody)
      })

      // And I should be taken back to the OoS bed timeline page
      Page.verifyOnPage(OutOfServiceBedShowPage, premises.id, outOfServiceBed)

      // And I should see a flash message informing me that the OoS bed has been updated
      showPage.shouldShowUpdateConfirmationMessage()
    })

    const dateFields = ['startDate', 'endDate']
    dateFields.forEach(dateField => {
      it(`shows when the ${dateField} field is empty`, () => {
        const bed: NamedId = { name: 'bed', id: '123' }
        const premises = cas1PremisesBasicSummaryFactory.build()
        const outOfServiceBed = outOfServiceBedFactory.build({
          bed,
        })

        // Given I am updating an out of service bed
        cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
        cy.task('stubUpdateOutOfServiceBedErrors', { premisesId: premises.id, outOfServiceBed, params: [dateField] })

        const updatePage = OutOfServiceBedUpdatePage.visit(premises.id, outOfServiceBed)

        // When I submit the form with no date
        updatePage.clearDateInputs(dateField)
        updatePage.clickSubmit()

        // Then I see an error
        updatePage.shouldShowErrorMessagesForFields([dateField])
      })
    })
  })
})

describe('Cancelling an out of service bed', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a CRU member
    signIn('cru_member')
  })

  it('should allow me to cancel an out of service bed', () => {
    const bed: NamedId = { name: 'bed', id: '123' }
    const premises = premisesFactory.build()
    const premisesId = premises.id

    const outOfServiceBeds = outOfServiceBedFactory.buildList(5, {
      bed,
      premises: { name: premises.name, id: premises.id },
    })
    const outOfServiceBed = outOfServiceBeds[0]
    const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

    // Given I am viewing an out of service bed
    cy.task('stubOutOfServiceBed', { premisesId, outOfServiceBed })
    cy.task('stubBed', { premisesId, bedDetail })
    cy.task('stubCancelOutOfServiceBed', { premisesId, outOfServiceBedId: outOfServiceBed.id })
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, premisesId, page: 1, perPage: 50 })
    cy.task('stubSinglePremises', premises)
    const showPage = OutOfServiceBedShowPage.visit(premisesId, outOfServiceBed)

    // When I click the action 'Cancel out of service bed'
    showPage.clickAction('Cancel out of service bed')

    // Then I should be taken to the OOSB cancellation confirmation page
    const cancelPage = Page.verifyOnPage(OutOfServiceBedCancelPage, outOfServiceBed)
    cancelPage.checkOnPage()

    // And I should see the details of the OOSB I'm about to cancel
    cancelPage.warningMessageShouldBeShown()

    // When I click 'Go back'
    cancelPage.clickLink('Go back')

    // I should be back on the OOB detail page
    Page.verifyOnPage(OutOfServiceBedShowPage, premisesId, outOfServiceBed)

    // When I click the action 'Cancel out of service bed' again
    showPage.clickAction('Cancel out of service bed')

    // Then I should be back on the confirmation page
    Page.verifyOnPage(OutOfServiceBedCancelPage, outOfServiceBed)

    // When I click Cancel out of service bed
    cancelPage.clickDoCancel()

    // Then the cancellation is sent to the API
    cy.task('verifyApiPost', paths.manage.premises.outOfServiceBeds.cancel({ premisesId, id: outOfServiceBed.id }))

    // And I should be taken to the OOSB list page
    const listPage = Page.verifyOnPage(OutOfServiceBedPremisesIndexPage, premises)
    listPage.shouldShowBanner(
      `Cancelled out of service bed for ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
    )
  })
})
