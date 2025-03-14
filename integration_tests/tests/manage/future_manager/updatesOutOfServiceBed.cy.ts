import { NamedId, UpdateCas1OutOfServiceBed } from '@approved-premises/api'
import {
  cas1BedDetailFactory,
  cas1PremisesBasicSummaryFactory,
  outOfServiceBedFactory,
} from '../../../../server/testutils/factories'
import Page from '../../../pages/page'

import { OutOfServiceBedShowPage, OutOfServiceBedUpdatePage } from '../../../pages/manage/outOfServiceBeds'
import { signIn } from '../../signIn'
import paths from '../../../../server/paths/api'

describe('Updating an out of service bed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')

    // Given I am signed in as a future manager
    signIn({ permissions: ['cas1_view_out_of_service_beds', 'cas1_out_of_service_bed_create'] })
  })

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
