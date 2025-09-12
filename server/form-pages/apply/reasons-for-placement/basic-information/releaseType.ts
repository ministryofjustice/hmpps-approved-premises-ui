import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import { getReleaseTypes } from '../../../utils/getReleaseTypes'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import TasklistPage from '../../../tasklistPage'
import SentenceType from './sentenceType'
import { Page } from '../../../utils/decorators'
import {
  PossibleReleaseTypeOptions,
  SelectableReleaseTypes,
  selectableReleaseTypes,
} from '../../../../utils/applications/releaseTypeUtils'

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What is the release type?'

  releaseTypes: PossibleReleaseTypeOptions

  constructor(
    readonly body: { releaseType?: SelectableReleaseTypes },
    readonly application: ApprovedPremisesApplication,
  ) {
    const sessionSentenceType = retrieveQuestionResponseFromFormArtifact(application, SentenceType)

    this.releaseTypes = getReleaseTypes(sessionSentenceType)

    this.body = {
      releaseType: body.releaseType as SelectableReleaseTypes,
    }
  }

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  response() {
    return { [this.title]: selectableReleaseTypes[this.body.releaseType] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.releaseType) {
      errors.releaseType = 'You must choose a release type'
    }

    return errors
  }

  items() {
    return Object.entries(this.releaseTypes).map(([value, text]) => {
      return {
        value,
        text,
        checked: this.body.releaseType === value,
      }
    })
  }
}
