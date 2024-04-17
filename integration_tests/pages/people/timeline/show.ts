import { Person, PersonalTimeline } from '../../../../server/@types/shared'
import { getStatus } from '../../../../server/utils/applications/getStatus'
import Page from '../../page'

export class ShowPage extends Page {
  timeline: PersonalTimeline

  constructor(timeline: PersonalTimeline, crn: Person['crn']) {
    super(`Application history for ${crn}`)
    this.timeline = timeline
  }

  shouldShowTimeline() {
    this.timeline.applications.forEach(applicationTimeline => {
      cy.get('h2').contains(applicationTimeline.createdBy.name)
      cy.get('.govuk-tag').contains(getStatus(applicationTimeline))

      this.shouldShowApplicationTimeline(applicationTimeline.timelineEvents)
    })
  }
}
