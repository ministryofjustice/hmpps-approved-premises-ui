import type { FormArtifact, TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../tasklistPage'
import { Page } from '../utils/decorators'
import {
  standardDeterminateReleaseTypes,
  extendedDeterminateReleaseTypes,
  lifeIppReleaseTypes,
  selectableReleaseTypes,
  SelectableReleaseTypes,
  SentenceTypeResponse,
  PossibleReleaseTypeOptions,
} from '../../utils/applications/releaseTypeUtils'
import { SessionDataError } from '../../utils/errors'

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What is the release type?'

  sentenceType: SentenceTypeResponse

  constructor(
    readonly body: { releaseType?: SelectableReleaseTypes },
    readonly formArtifact: FormArtifact,
  ) {
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
    const releaseTypes = this.getReleaseTypes()
    return Object.entries(releaseTypes).map(([value, text]) => {
      return {
        value,
        text,
        checked: this.body.releaseType === value,
      }
    })
  }

  getReleaseTypes(): PossibleReleaseTypeOptions {
    if (this.sentenceType === 'standardDeterminate') {
      return standardDeterminateReleaseTypes
    }
    if (this.sentenceType === 'life' || this.sentenceType === 'ipp') {
      return lifeIppReleaseTypes
    }
    if (this.sentenceType === 'extendedDeterminate') {
      return extendedDeterminateReleaseTypes
    }
    throw new SessionDataError(`Unknown sentence type ${this.sentenceType}`)
  }
}
