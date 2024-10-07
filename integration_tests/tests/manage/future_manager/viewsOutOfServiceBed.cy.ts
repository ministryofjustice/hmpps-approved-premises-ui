import {
  bedDetailFactory,
  outOfServiceBedFactory,
  outOfServiceBedRevisionFactory,
  premisesFactory,
} from '../../../../server/testutils/factories'
import { sortOutOfServiceBedRevisionsByUpdatedAt } from '../../../../server/utils/outOfServiceBedUtils'
import { OutOfServiceBedShowPage } from '../../../pages/manage/outOfServiceBeds'
import { signIn } from '../../signIn'

context('OutOfServiceBeds', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubOutOfServiceBedReasons')
  })

  describe('for a new out of service bed with all nullable fields present in the initial OoS bed revision', () => {
    it('should show a out of service bed', () => {
      // Given I am signed in with permission to view out of service beds
      signIn([], ['cas1_view_out_of_service_beds'])

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
      // Given I am signed in with permission to view out of service beds
      signIn([], ['cas1_view_out_of_service_beds'])

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
