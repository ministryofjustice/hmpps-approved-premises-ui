import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import { SessionDataError } from '../../../../utils/errors'
import { retrieveQuestionResponseFromApplication } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { SentenceTypesT } from './sentenceType'
import { Page } from '../../../utils/decorators'

const allReleaseTypes = {
  rotl: 'Release on Temporary Licence (ROTL)',
  hdc: 'Home detention curfew (HDC)',
  licence: 'Licence',
  pss: 'Post Sentence Supervision (PSS)',
} as const

type AllReleaseTypes = typeof allReleaseTypes
type ReducedReleaseTypes = Pick<AllReleaseTypes, 'rotl' | 'licence'>
type SentenceType = Extract<
  SentenceTypesT,
  'standardDeterminate' | 'extendedDeterminate' | 'ipp' | 'life' | 'nonStatutory'
>

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What type of release will the application support?'

  releaseTypes: AllReleaseTypes | ReducedReleaseTypes

  constructor(
    readonly body: { releaseType?: keyof AllReleaseTypes | keyof ReducedReleaseTypes },
    readonly application: ApprovedPremisesApplication,
  ) {
    const sessionSentenceType = retrieveQuestionResponseFromApplication<SentenceType>(
      application,
      'basic-information',
      'sentenceType',
    )

    this.releaseTypes = this.getReleaseTypes(sessionSentenceType)

    this.body = {
      releaseType: body.releaseType as keyof (AllReleaseTypes | ReducedReleaseTypes),
    }
  }

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  response() {
    return { [this.title]: allReleaseTypes[this.body.releaseType] }
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

  getReleaseTypes(sessionReleaseType: SentenceType): AllReleaseTypes | ReducedReleaseTypes {
    if (sessionReleaseType === 'standardDeterminate' || sessionReleaseType === 'nonStatutory') {
      return allReleaseTypes
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
