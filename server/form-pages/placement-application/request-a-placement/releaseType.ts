import type { PlacementApplication } from '@approved-premises/api'

import { Page } from '../../utils/decorators'
import { SelectableReleaseTypes } from '../../../utils/applications/releaseTypeUtils'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'
import SentenceType from './sentenceType'
import BaseReleaseType from '../../shared-examples/releaseType'

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType extends BaseReleaseType {
  constructor(
    readonly body: { releaseType?: SelectableReleaseTypes },
    placementApplication: PlacementApplication,
  ) {
    super(body, placementApplication)

    this.sentenceType = retrieveQuestionResponseFromFormArtifact(placementApplication, SentenceType)
  }

  next() {
    if (this.body.releaseType === 'rotl') return 'previous-rotl-placement'
    if (this.body.releaseType === 'paroleDirectedLicence') return 'decision-to-release'
    return 'additional-placement-details'
  }
}
