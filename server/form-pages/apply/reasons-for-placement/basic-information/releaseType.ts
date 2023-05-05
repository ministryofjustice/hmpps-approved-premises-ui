import type { ApprovedPremisesApplication, ReleaseTypeOption } from '@approved-premises/api'
import type { ReleaseTypeOptions, TaskListErrors } from '@approved-premises/ui'

import { SessionDataError } from '../../../../utils/errors'
import { retrieveQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment'
import TasklistPage from '../../../tasklistPage'
import SentenceType, { SentenceTypesT } from './sentenceType'
import { Page } from '../../../utils/decorators'
import { allReleaseTypes } from '../../../../utils/applications/releaseTypeUtils'

type SelectableReleaseType = Exclude<ReleaseTypeOption, 'in_community'>
type ReducedReleaseTypeOptions = Pick<ReleaseTypeOptions, 'rotl' | 'licence'>
type ReducedReleaseTypes = keyof ReducedReleaseTypeOptions

type SentenceTypeResponse = Extract<SentenceTypesT, 'standardDeterminate' | 'extendedDeterminate' | 'ipp' | 'life'>

const { in_community: _, ...releaseTypes } = allReleaseTypes

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What type of release will the application support?'

  releaseTypes: ReleaseTypeOptions | ReducedReleaseTypeOptions

  constructor(
    readonly body: { releaseType?: SelectableReleaseType | ReducedReleaseTypes },
    readonly application: ApprovedPremisesApplication,
  ) {
    const sessionSentenceType = retrieveQuestionResponseFromApplicationOrAssessment(application, SentenceType)

    this.releaseTypes = this.getReleaseTypes(sessionSentenceType)

    this.body = {
      releaseType: body.releaseType as SelectableReleaseType | ReducedReleaseTypes,
    }
  }

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  response() {
    return { [this.title]: releaseTypes[this.body.releaseType] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.releaseType) {
      errors.releaseType = 'You must choose a release type'
    }

    return errors
  }

  items() {
    return Object.keys(this.releaseTypes).map(key => {
      return {
        value: key,
        text: this.releaseTypes[key],
        checked: this.body.releaseType === key,
      }
    })
  }

  getReleaseTypes(sessionReleaseType: SentenceTypeResponse): ReleaseTypeOptions | ReducedReleaseTypeOptions {
    if (sessionReleaseType === 'standardDeterminate') {
      return releaseTypes
    }
    if (sessionReleaseType === 'extendedDeterminate' || sessionReleaseType === 'ipp' || sessionReleaseType === 'life') {
      return {
        rotl: 'Release on Temporary Licence (ROTL)',
        licence: 'Licence',
      }
    }
    throw new SessionDataError(`Unknown release type ${sessionReleaseType}`)
  }
}
