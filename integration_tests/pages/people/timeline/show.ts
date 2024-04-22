import { FullPerson, PersonalTimeline } from '../../../../server/@types/shared'
import { getStatus } from '../../../../server/utils/applications/getStatus'
import Page from '../../page'

export class ShowPage extends Page {
  timeline: PersonalTimeline

  constructor(timeline: PersonalTimeline, person: FullPerson) {
    super(`Application history for ${person.name}`)
    this.timeline = timeline
  }

  shouldShowTimeline() {
    this.timeline.applications.forEach((applicationTimeline, index) => {
      cy.get('h2').contains(applicationTimeline.createdBy.name)
      cy.get(`[data-cy-status="application ${index + 1}"]`).should(
        'contain.html',
        getStatus(applicationTimeline, 'govuk-tag--timeline-tag'),
      )

      this.shouldShowApplicationTimeline(applicationTimeline.timelineEvents, index)
    })
  }
}
