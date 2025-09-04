import { Page } from '../../utils/decorators'
import SituationBase, { Body } from '../../shared-examples/situation'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { getPageName, getTaskName } from '../../utils'
import SentenceType from './sentenceType'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'

@Page({ name: 'situation', bodyProperties: ['situation'] })
export default class Situation extends SituationBase {
  constructor(
    readonly body: Body,
    readonly application: ApprovedPremisesApplication,
  ) {
    super(body)

    const sessionSentenceType = retrieveQuestionResponseFromFormArtifact(application, SentenceType)

    this.situations = this.getSituationsForSentenceType(sessionSentenceType)
  }

    next() {
    return 'additional-placement-details'
  }
}
