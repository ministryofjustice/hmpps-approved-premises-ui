import { Cas1NewOutOfServiceBed, NamedId, UpdateCas1OutOfServiceBed } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import {
  cas1BedDetailFactory,
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
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

describe('Out of service beds', () => {
  const bed: NamedId = { name: 'abc', id: faker.string.uuid() }
  const premises = premisesFactory.build({ name: 'Hope House' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')

    GIVEN('I am signed in as a Future manager')
    signIn('future_manager')
  })

  it('allows me to view all out of service beds for a given premises', () => {
    const outOfServiceBeds = outOfServiceBedFactory.buildList(10)
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, page: 1, perPage: 50, premisesId: premises.id })
    cy.task('stubSinglePremises', premises)

    GIVEN('I am on the out-of-service bed list for the premises')
    OutOfServiceBedPremisesIndexPage.visit(premises)

    THEN('I should see the list of out-of-service beds for the premises')
    const page = Page.verifyOnPage(OutOfServiceBedPremisesIndexPage, premises)

    AND('I should see the count of total results (not limited to page)')
    page.hasCountOfAllResultsMatchingFilter()
  })

  describe('viewing an out of service bed record', () => {
    describe('for a new out of service bed with all nullable fields present in the initial OoS bed revision', () => {
      it('should show an out of service bed', () => {
        GIVEN('I have created a out of service bed')
        const outOfServiceBed = outOfServiceBedFactory.build({ bed })
        outOfServiceBed.revisionHistory = sortOutOfServiceBedRevisionsByUpdatedAt(outOfServiceBed.revisionHistory)
        const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

        cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
        cy.task('stubBed', { premisesId: premises.id, bedDetail })

        AND("I visit that out of service bed's show page")
        const page = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

        THEN('I should see the latest details of that out of service bed')
        page.shouldShowOutOfServiceBedDetail()

        AND('I should see the bed characteristics')
        page.shouldShowCharacteristics(bedDetail)

        AND('I should see links to the premises and bed in the page heading')
        page.shouldLinkToPremisesAndBed(outOfServiceBed)

        WHEN("I click the 'Timeline' tab")
        page.clickTab('Timeline')

        THEN("I should see the timeline of that out of service bed's revision")
        page.shouldShowTimeline()
      })
    })

    describe('for a legacy "lost bed" records migrated with all nullable fields not present in the initial OoS bed revision', () => {
      it('should show a out of service bed', () => {
        GIVEN('I have created a out of service bed')
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

        AND("I visit that out of service bed's show page")
        const page = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

        WHEN("I click the 'Timeline' tab")
        page.clickTab('Timeline')

        THEN("I should see the timeline of that out of service bed's revision")
        page.shouldShowTimeline()
      })
    })
  })

  describe('creating an out of service bed record', () => {
    it('should allow me to create an out of service bed', () => {
      const bedName = '12 - 2'
      cy.task('stubSinglePremises', premises)

      const outOfServiceBed = outOfServiceBedFactory.build({
        startDate: '2022-02-11',
        endDate: '2022-03-11',
      })
      cy.task('stubOutOfServiceBedCreate', { premisesId: premises.id, outOfServiceBed })

      // stub ultimate API call when redirecting to bed page
      const bedDetail = cas1BedDetailFactory.build({ id: outOfServiceBed.bed.id, name: bedName })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })

      WHEN('I navigate to the out of service bed form')
      const page = OutOfServiceBedCreatePage.visit(premises.id, outOfServiceBed.bed.id)

      AND('I fill out the form')
      page.completeForm(outOfServiceBed)
      page.clickSubmit()

      THEN('a POST to the API should be made to create the OOSB record')
      cy.task('verifyApiPost', paths.manage.premises.outOfServiceBeds.create({ premisesId: premises.id })).then(
        (requestBody: Cas1NewOutOfServiceBed) => {
          expect(requestBody.startDate).equal(outOfServiceBed.startDate)
          expect(requestBody.endDate).equal(outOfServiceBed.endDate)
          expect(requestBody.notes).equal(outOfServiceBed.notes)
          expect(requestBody.referenceNumber).equal(outOfServiceBed.referenceNumber)
          expect(requestBody.reason).equal(outOfServiceBed.reason.id)
        },
      )

      AND('I should be redirected to the bed page')
      const bedPage = Page.verifyOnPage(BedShowPage, bedName)

      AND('I should see the confirmation message')
      bedPage.shouldShowBanner('The out of service bed has been recorded')
    })

    it('should show errors', () => {
      WHEN('I navigate to the out of service bed form')
      const page = OutOfServiceBedCreatePage.visit(premises.id, bed.id)

      AND('I have errors on validated fields')
      cy.task('stubOutOfServiceBedErrors', {
        premisesId: premises.id,
        params: ['startDate', 'endDate', 'reason', 'notes'],
      })

      page.clickSubmit()

      THEN('I should see error messages relating to that field')
      page.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'reason', 'notes'])
    })

    it('should show an error when there are out of service bed conflicts', () => {
      const conflictingOutOfServiceBed = outOfServiceBedFactory.build({
        bed,
        startDate: '2022-02-11',
        endDate: '2022-03-11',
      })

      cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed: conflictingOutOfServiceBed })
      const bedDetail = cas1BedDetailFactory.build({ id: bed.id })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })

      WHEN('I navigate to the out of service bed form')
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

      AND('I fill out the form')
      page.completeForm(outOfServiceBed)
      page.clickSubmit()

      THEN('I should see an error message')
      page.shouldShowDateConflictErrorMessages(conflictingOutOfServiceBed, 'lost-bed')
    })
  })

  describe('Updating an out of service bed', () => {
    it('should allow me to update an out of service bed', () => {
      const outOfServiceBed = outOfServiceBedFactory.build({
        bed,
      })
      const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

      GIVEN('I am viewing an out of service bed')
      cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
      cy.task('stubBed', { premisesId: premises.id, bedDetail })
      const showPage = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

      WHEN("I click 'Update record'")
      showPage.clickAction('Update out of service bed')

      THEN('I should be taken to the OoS bed update page')
      const updatePage = Page.verifyOnPage(OutOfServiceBedUpdatePage, outOfServiceBed)

      AND('it should show the details of the bed from the OoS bed record')
      updatePage.shouldShowOutOfServiceBedDetails(outOfServiceBed)
      updatePage.formShouldBePrepopulated()

      GIVEN('I want to update some details of the OoS bed')
      cy.task('stubOutOfServiceBedUpdate', { premisesId: premises.id, outOfServiceBed })
      const updatedOutOfServiceBed = outOfServiceBedFactory.build({ id: outOfServiceBed.id, bed })

      WHEN('I submit the form')
      updatePage.completeForm(updatedOutOfServiceBed)
      updatePage.clickSubmit()

      THEN('the update is sent to the API')
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

      AND('I should be taken back to the OoS bed timeline page')
      Page.verifyOnPage(OutOfServiceBedShowPage, premises.id, outOfServiceBed)

      AND('I should see a flash message informing me that the OoS bed has been updated')
      showPage.shouldShowUpdateConfirmationMessage()
    })

    const dateFields = ['startDate', 'endDate']
    dateFields.forEach(dateField => {
      it(`shows when the ${dateField} field is empty`, () => {
        const outOfServiceBed = outOfServiceBedFactory.build({
          bed,
        })

        GIVEN('I am updating an out of service bed')
        cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
        cy.task('stubUpdateOutOfServiceBedErrors', { premisesId: premises.id, outOfServiceBed, params: [dateField] })

        const updatePage = OutOfServiceBedUpdatePage.visit(premises.id, outOfServiceBed)

        WHEN('I submit the form with no date')
        updatePage.clearDateInputs(dateField)
        updatePage.clickSubmit()

        THEN('I see an error')
        updatePage.shouldShowErrorMessagesForFields([dateField])
      })
    })
  })
})

describe('Cancelling an out of service bed', () => {
  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as a CRU member')
    signIn('cru_member')
  })

  it('should allow me to cancel an out of service bed', () => {
    const premises = premisesFactory.build()
    const premisesId = premises.id
    const bed: NamedId = { name: 'abc', id: faker.string.uuid() }
    const outOfServiceBeds = outOfServiceBedFactory.buildList(5, {
      bed,
      premises: { name: premises.name, id: premises.id },
    })
    const outOfServiceBed = outOfServiceBeds[0]
    const bedDetail = cas1BedDetailFactory.build({ id: bed.id })

    GIVEN('I am viewing an out of service bed')
    cy.task('stubOutOfServiceBed', { premisesId, outOfServiceBed })
    cy.task('stubBed', { premisesId, bedDetail })
    cy.task('stubCancelOutOfServiceBed', { premisesId, outOfServiceBedId: outOfServiceBed.id })
    cy.task('stubOutOfServiceBedsList', { outOfServiceBeds, premisesId, page: 1, perPage: 50 })
    cy.task('stubSinglePremises', premises)
    const showPage = OutOfServiceBedShowPage.visit(premisesId, outOfServiceBed)

    WHEN("I click the action 'Cancel out of service bed'")
    showPage.clickAction('Cancel out of service bed')

    THEN('I should be taken to the OOSB cancellation confirmation page')
    const cancelPage = Page.verifyOnPage(OutOfServiceBedCancelPage, outOfServiceBed)
    cancelPage.checkOnPage()

    AND("I should see the details of the OOSB I'm about to cancel")
    cancelPage.warningMessageShouldBeShown()

    WHEN("I click 'Go back'")
    cancelPage.clickLink('Go back')

    THEN('I should be back on the OOB detail page')
    Page.verifyOnPage(OutOfServiceBedShowPage, premisesId, outOfServiceBed)

    WHEN("I click the action 'Cancel out of service bed' again")
    showPage.clickAction('Cancel out of service bed')

    THEN('I should be back on the confirmation page')
    Page.verifyOnPage(OutOfServiceBedCancelPage, outOfServiceBed)

    WHEN('I click Cancel out of service bed')
    cancelPage.clickDoCancel()

    THEN('the cancellation is sent to the API')
    cy.task('verifyApiPost', paths.manage.premises.outOfServiceBeds.cancel({ premisesId, id: outOfServiceBed.id }))

    AND('I should be taken to the OOSB list page')
    const listPage = Page.verifyOnPage(OutOfServiceBedPremisesIndexPage, premises)
    listPage.shouldShowBanner(
      `Cancelled out of service bed for ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
    )
  })
})
