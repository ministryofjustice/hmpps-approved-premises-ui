import type { Request } from 'express'
import {
  Cas1AuthorisedPlacementPeriod,
  PlacementApplication,
  PlacementApplicationDecisionEnvelope,
} from '@approved-premises/api'
import { weeksToDays } from 'date-fns'
import { validWeeksAndDaysDuration } from '../formUtils'

export type AssessmentStep = 'review' | 'decision'

export type PlacementApplicationSessionBody = Partial<PlacementApplicationDecisionEnvelope> & {
  durationWeeks?: string
  durationDays?: string
}

export class PlacementApplicationReview {
  applicationId: string

  body: PlacementApplicationSessionBody

  errors: Record<string, string> = {}

  step: AssessmentStep

  constructor(
    private readonly request: Request,
    step: AssessmentStep,
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

    this.body = {
      ...this.request.session.placementApplicationDecisions[this.applicationId],
      ...this.request.body,
    }
    this.request.session.placementApplicationDecisions[this.applicationId] = this.body
  }

  getSubmissionData(placementApplication: PlacementApplication): PlacementApplicationDecisionEnvelope {
    const { decisionSummary, summaryOfChanges, decision, durationWeeks, durationDays } = this.body

    const { requestedPlacementPeriod } = placementApplication
    const lengthOfStayWeeksInDays = weeksToDays(Number(durationWeeks || 0))
    const duration = lengthOfStayWeeksInDays + Number(durationDays || 0)

    requestedPlacementPeriod.duration = requestedPlacementPeriod.duration || duration
    const authorisedPlacementPeriod: Cas1AuthorisedPlacementPeriod = { duration, ...requestedPlacementPeriod }

    return {
      decisionSummary,
      summaryOfChanges,
      decision,
      acceptance: { authorisedPlacementPeriod },
    }
  }

  validate(body: PlacementApplicationSessionBody) {
    if (this.step === 'review' && !body.summaryOfChanges) {
      this.errors.summaryOfChanges = 'You must provide a summary of the changes'
    }
    if (this.step === 'decision') {
      if (!body.decision) {
        this.errors.decision = 'You must provide a decision'
      }
      if (
        body.decision === 'accepted' &&
        body.durationWeeks !== undefined &&
        !validWeeksAndDaysDuration(body.durationWeeks, body.durationDays)
      ) {
        this.errors.duration = 'Enter the recommended placement length'
      }

      if (!body.decisionSummary) {
        this.errors.decisionSummary = 'You must provide a decision summary'
      }
    }
  }
}
