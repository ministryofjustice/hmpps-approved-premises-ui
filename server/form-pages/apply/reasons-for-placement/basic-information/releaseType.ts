import { omit, pick } from 'underscore'

import type { ApprovedPremisesApplication, SentenceTypeOption } from '@approved-premises/api'
import type { ReleaseTypeOptions, TaskListErrors } from '@approved-premises/ui'

import { SessionDataError } from '../../../../utils/errors'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import TasklistPage from '../../../tasklistPage'
import SentenceType from './sentenceType'
import { Page } from '../../../utils/decorators'
import { allReleaseTypes } from '../../../../utils/applications/releaseTypeUtils'

type SelectableReleaseTypes = keyof PossibleReleaseTypeOptions
type ExtendedDetermindateReleaseTypeOptions = Pick<
  ReleaseTypeOptions,
  'rotl' | 'extendedDeterminateLicence' | 'paroleDirectedLicence'
>
type StandardDeterminateReleaseTypeOptions = Pick<
  ReleaseTypeOptions,
  'licence' | 'paroleDirectedLicence' | 'rotl' | 'hdc' | 'pss'
>
type LifeIppReleaseTypeOptions = Pick<ReleaseTypeOptions, 'rotl' | 'licence'>
type PossibleReleaseTypeOptions =
  | ExtendedDetermindateReleaseTypeOptions
  | StandardDeterminateReleaseTypeOptions
  | LifeIppReleaseTypeOptions

type SentenceTypeResponse = Extract<SentenceTypeOption, 'standardDeterminate' | 'extendedDeterminate' | 'ipp' | 'life'>

const selectableReleaseTypes = omit(allReleaseTypes, 'in_community')

@Page({ name: 'release-type', bodyProperties: ['releaseType'] })
export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What type of release will the application support?'

  releaseTypes: PossibleReleaseTypeOptions

  constructor(
    readonly body: { releaseType?: SelectableReleaseTypes },
    readonly application: ApprovedPremisesApplication,
  ) {
    const sessionSentenceType = retrieveQuestionResponseFromFormArtifact(application, SentenceType)

    this.releaseTypes = this.getReleaseTypes(sessionSentenceType)

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
    return Object.keys(this.releaseTypes).map(key => {
      return {
        value: key,
        text: this.releaseTypes[key],
        checked: this.body.releaseType === key,
      }
    })
  }

  getReleaseTypes(sessionSentenceType: SentenceTypeResponse): PossibleReleaseTypeOptions {
    if (sessionSentenceType === 'standardDeterminate') {
      return pick(selectableReleaseTypes, ['licence', 'paroleDirectedLicence', 'rotl', 'hdc', 'pss'])
    }
    if (sessionSentenceType === 'life' || sessionSentenceType === 'ipp') {
      return pick(selectableReleaseTypes, ['rotl', 'licence'])
    }
    if (sessionSentenceType === 'extendedDeterminate') {
      return pick(selectableReleaseTypes, ['rotl', 'extendedDeterminateLicence', 'paroleDirectedLicence'])
    }
    throw new SessionDataError(`Unknown sentence type ${sessionSentenceType}`)
  }
}
