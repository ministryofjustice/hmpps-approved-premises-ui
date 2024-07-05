import {
  bedDetailFactory,
  bedSummaryFactory,
  extendedPremisesSummaryFactory,
} from '../../../server/testutils/factories'

import BedShowPage from '../../pages/v2Manage/bed/bedShow'
import { OutOfServiceBedCreatePage } from '../../pages/v2Manage/outOfServiceBeds'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('Beds', () => {
  const premisesId = 'premisesId'
  const premises = extendedPremisesSummaryFactory.build({ id: premisesId })
  const bedSummaries = bedSummaryFactory.buildList(5)
  const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })

  beforeEach(() => {
    cy.task('reset')

    // Given there are beds and a premises in the database
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })
    cy.task('stubLostBedReferenceData')
    cy.task('stubPremisesSummary', premises)
  })

  it('should allow Future Manager to view bed information and mark it out of service', () => {
    // Given I am signed in as a future_manager
    signIn(['future_manager'])

    // When I visit the bed page
    const bedPage = BedShowPage.visit(premises.id, bedDetail)

    // Then I should see the premises name
    bedPage.shouldShowPremisesName(premises.name)

    // And I should see the room details
    bedPage.shouldShowBedDetails(bedDetail)

    // When I click on the link to mark the bed out of service
    bedPage.clickOutOfServiceBedOption()

    // Then I am taken to the mark bed out of service page
    Page.verifyOnPage(OutOfServiceBedCreatePage)
  })
})
