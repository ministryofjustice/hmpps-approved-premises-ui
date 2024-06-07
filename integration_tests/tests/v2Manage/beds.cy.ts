import { bedDetailFactory, bedSummaryFactory } from '../../../server/testutils/factories'

import { BedShowPage, BedsListPage } from '../../pages/manage'
import { OutOfServiceBedCreatePage } from '../../pages/manage/outOfServiceBeds'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('Beds', () => {
  const premisesId = 'premisesId'
  const bedSummaries = bedSummaryFactory.buildList(5)
  const bedDetail = bedDetailFactory.build({ ...bedSummaries[0] })

  beforeEach(() => {
    cy.task('reset')

    // Given there are beds in the database
    cy.task('stubBeds', { premisesId, bedSummaries })
    cy.task('stubBed', { premisesId, bedDetail })
    cy.task('stubLostBedReferenceData')
  })

  it('should allow Future Manager to visit a bed from the bed list page and mark it out of service', () => {
    // Given I am signed in as a future_manager
    signIn(['future_manager'])

    // When I visit the rooms page
    const bedsPage = BedsListPage.visit(premisesId, { v2: true })

    // Then I should see all of the rooms listed
    bedsPage.shouldShowBeds(bedSummaries, premisesId)

    // When I click on a bed
    bedsPage.clickBed(bedDetail)

    // Then I should be taken to the bed page
    Page.verifyOnPage(BedShowPage)

    // When I visit the bed page
    const bedPage = BedShowPage.visit(premisesId, bedDetail, { v2: true })

    // Then I should see the room details
    bedPage.shouldShowBedDetails(bedDetail)

    // When I click on the link to mark the bed out of service
    bedPage.clickOutOfServiceBedOption()

    // Then I am taken to the mark bed out of service page
    Page.verifyOnPage(OutOfServiceBedCreatePage)
  })
})
