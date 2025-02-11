import { Cas1PersonalTimeline, FullPerson } from '@approved-premises/api'
import Page from '../../page'
import { ApplicationStatusTag } from '../../../../server/utils/applications/statusTag'

export class ShowPage extends Page {
  timeline: Cas1PersonalTimeline

  constructor(timeline: Cas1PersonalTimeline, person: FullPerson) {
    super(`Application history for ${person.name}`)
    this.timeline = timeline
  }

  shouldShowTimeline() {
    this.timeline.applications.forEach((applicationTimeline, index) => {
      if (!applicationTimeline.isOfflineApplication) {
        const statusTag = new ApplicationStatusTag(applicationTimeline.status, { showOnOneLine: true })
        cy.get('h2').contains(applicationTimeline.createdBy.name)
        cy.get(`[data-cy-status="${statusTag.status}"]`).should('contain', statusTag.uiStatus)
      }

      this.shouldShowApplicationTimeline(applicationTimeline.timelineEvents, index)
    })
  }
}
