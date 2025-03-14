import { NamedId } from '@approved-premises/api'
import { cas1BedDetailFactory, outOfServiceBedFactory, premisesFactory } from '../../../../server/testutils/factories'
import Page from '../../../pages/page'

import {
  OutOfServiceBedCancelPage,
  OutOfServiceBedPremisesIndexPage,
  OutOfServiceBedShowPage,
} from '../../../pages/manage/outOfServiceBeds'
import { signIn } from '../../signIn'
import paths from '../../../../server/paths/api'

describe('Cancelling an out of service bed', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a future manager
    signIn({ permissions: ['cas1_view_out_of_service_beds', 'cas1_out_of_service_bed_create'] })
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
