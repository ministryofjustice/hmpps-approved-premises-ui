import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import SentenceType from './sentenceType'
import { Page } from '../../../utils/decorators'
import { SelectableReleaseTypes } from '../../../../utils/applications/releaseTypeUtils'
import BaseReleaseType from '../../../shared-examples/releaseType'

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType extends BaseReleaseType {
  constructor(
    readonly body: { releaseType?: SelectableReleaseTypes },
    readonly application: ApprovedPremisesApplication,
  ) {
    super(body, application)

    this.sentenceType = retrieveQuestionResponseFromFormArtifact(application, SentenceType)
  }
}
