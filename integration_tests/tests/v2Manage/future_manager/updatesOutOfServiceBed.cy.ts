import { NamedId } from '../../../../server/@types/shared'
import {
  bedDetailFactory,
  extendedPremisesSummaryFactory,
  outOfServiceBedFactory,
} from '../../../../server/testutils/factories'
import Page from '../../../pages/page'

import { OutOfServiceBedShowPage, OutOfServiceBedUpdatePage } from '../../../pages/v2Manage/outOfServiceBeds'
import { signIn } from '../../signIn'

describe('Updating an out of service bed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')
    signIn(['future_manager'])
  })

  it('should allow me to update an out of service bed', () => {
    const bed: NamedId = { name: 'bed', id: '123' }
    const premises = extendedPremisesSummaryFactory.build()
    const outOfServiceBed = outOfServiceBedFactory.build({
      bed,
    })
    const bedDetail = bedDetailFactory.build({ id: bed.id })

    // Given I am viewing an out of service bed
    cy.task('stubOutOfServiceBed', { premisesId: premises.id, outOfServiceBed })
    cy.task('stubBed', { premisesId: premises.id, bedDetail })
    const showPage = OutOfServiceBedShowPage.visit(premises.id, outOfServiceBed)

    // When I click 'Update record'
    showPage.clickUpdateRecord()

    // Then I should be taken to the OoS bed update page
    const updatePage = Page.verifyOnPage(OutOfServiceBedUpdatePage, outOfServiceBed)

    // And it should show the details of the bed from the OoS bed record
    updatePage.shouldShowOutOfServiceBedDetails(outOfServiceBed)
    updatePage.formShouldBePrepopulated()
  })
})
