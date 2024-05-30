import { FullPerson, PersonalTimeline } from '../../../../server/@types/shared'
import Page from '../../page'
import { ApplicationStatusTag } from '../../../../server/utils/applications/statusTag'

export class ShowPage extends Page {
  timeline: PersonalTimeline

  constructor(timeline: PersonalTimeline, person: FullPerson) {
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
