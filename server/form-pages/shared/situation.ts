import type { SentenceTypeOption, SituationOption } from '@approved-premises/api'
import { FormArtifact, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../utils/decorators'

import { SessionDataError } from '../../utils/errors'
import TasklistPage from '../tasklistPage'

export const situations: Record<SituationOption, string> = {
  riskManagement: 'Application for risk management/public protection',
  residencyManagement: 'Specified residency requirement as part of a community based Order',
  bailAssessment: 'Bail assessment for residency requirement as part of a community order or suspended sentence order',
  bailSentence: 'Bail placement',
  awaitingSentence: 'Awaiting sentence',
}

type CommunityOrderSituations = Pick<typeof situations, 'riskManagement' | 'residencyManagement'>
type BailPlacementSituations = Pick<typeof situations, 'bailAssessment' | 'bailSentence' | 'awaitingSentence'>

export type Body = { situation?: keyof CommunityOrderSituations | keyof BailPlacementSituations }

@Page({ name: 'situation', bodyProperties: ['situation'] })
export default class Situation implements TasklistPage {
  title = 'What is the reason for placing this person in an AP?'

  sentenceType: SentenceTypeOption

  constructor(
    readonly body: Body,
    readonly formArtifact: FormArtifact,
  ) {}

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  response() {
    return { [`${this.title}`]: situations[this.body.situation] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.situation) {
      errors.situation = 'You must choose a situation'
    }

    return errors
  }

  items() {
    return Object.entries(this.getSituationsForSentenceType()).map(([value, text]) => ({
      value,
      text,
      checked: this.body.situation === value,
    }))
  }

  getSituationsForSentenceType(): CommunityOrderSituations | BailPlacementSituations {
    if (this.sentenceType === 'communityOrder') {
      return { riskManagement: situations.riskManagement, residencyManagement: situations.residencyManagement }
    }
    if (this.sentenceType === 'bailPlacement') {
      return {
        bailAssessment: situations.bailAssessment,
        bailSentence: situations.bailSentence,
        awaitingSentence: situations.awaitingSentence,
      }
    }
    throw new SessionDataError(`Unknown sentence type ${this.sentenceType}`)
  }
}
