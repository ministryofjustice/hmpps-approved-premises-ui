import { omit, pick } from 'underscore'

import type { PlacementApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import {
  PossibleReleaseTypeOptions,
  selectableReleaseTypes,
  SelectableReleaseTypes,
} from '../../../utils/applications/releaseTypeUtils'
import { getReleaseTypes } from '../../utils/getReleaseTypes'



@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What is the release type?'

  releaseTypes: PossibleReleaseTypeOptions

  constructor(
    readonly body: { releaseType?: SelectableReleaseTypes },
    placementApplication: PlacementApplication,
  ) {

    const { sentenceType } = placementApplication.data?.['request-a-placement']?.['sentence-type'] || {}

    this.releaseTypes = getReleaseTypes(sentenceType)

    this.body = {
      releaseType: body.releaseType as SelectableReleaseTypes,
    }
  }

  next() {
    if (this.body.releaseType === 'rotl') return 'previous-rotl-placement'
    if (this.body.releaseType === 'paroleDirectedLicence') return 'decision-to-release'
    return 'additional-placement-details'
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
