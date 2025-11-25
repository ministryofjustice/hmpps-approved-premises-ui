import { FormArtifact } from '@approved-premises/ui'
import SituationBase, { Body } from '../../../shared/situation'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import SentenceType from './sentenceType'

export default class Situation extends SituationBase {
  constructor(
    readonly body: Body,
    readonly formArtifact: FormArtifact,
  ) {
    super(body, formArtifact)

    this.sentenceType = retrieveQuestionResponseFromFormArtifact(formArtifact, SentenceType, 'sentenceType')
  }
}
