import { PlacementApplicationDecisionEnvelope } from '@approved-premises/api'
import type { Request } from 'express'

export class PlacementApplicationReview {
  applicationId: string

  body: Partial<PlacementApplicationDecisionEnvelope>

  errors: Record<string, string> = {}

  step: 'review' | 'decision'

  constructor(
    private readonly request: Request,
    step: 'review' | 'decision',
  ) {
    this.applicationId = request.params.id
    this.body = this.request.session?.placementApplicationDecisions?.[this.applicationId] || {}
    this.step = step
  }

  update() {
    this.validate(this.request.body)

    if (this.errors && Object.keys(this.errors).length > 0) {
      throw new Error('Invalid request body')
    }

    this.request.session.placementApplicationDecisions = this.request.session?.placementApplicationDecisions || {}

    this.request.session.placementApplicationDecisions[this.applicationId] = {
      ...this.request.session.placementApplicationDecisions[this.applicationId],
      ...this.request.body,
    }
  }

  validate(body: Partial<PlacementApplicationDecisionEnvelope>) {
    if (this.step === 'review' && !body.summaryOfChanges) {
      this.errors.summaryOfChanges = 'You must provide a summary of the changes'
    }

    if (this.step === 'decision') {
      if (!body.decision) {
        this.errors.decision = 'You must provide a decision'
      }
      if (!body.decisionSummary) {
        this.errors.decisionSummary = 'You must provide a decision summary'
      }
    }
  }
}
