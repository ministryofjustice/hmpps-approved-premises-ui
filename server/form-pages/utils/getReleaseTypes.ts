import {
  PossibleReleaseTypeOptions,
  selectableReleaseTypes,
  SentenceTypeResponse,
} from '../../utils/applications/releaseTypeUtils'
import { SessionDataError } from '../../utils/errors'
import { pick } from 'underscore'

export const getReleaseTypes = (sessionSentenceType: SentenceTypeResponse): PossibleReleaseTypeOptions => {
  if (sessionSentenceType === 'standardDeterminate') {
    return pick(selectableReleaseTypes, [
      'licence',
      'paroleDirectedLicence',
      'rotl',
      'hdc',
      'pss',
      'reReleasedPostRecall',
    ])
  }
  if (sessionSentenceType === 'life' || sessionSentenceType === 'ipp') {
    return pick(selectableReleaseTypes, ['rotl', 'licence'])
  }
  if (sessionSentenceType === 'extendedDeterminate') {
    return pick(selectableReleaseTypes, ['rotl', 'extendedDeterminateLicence', 'paroleDirectedLicence'])
  }
  throw new SessionDataError(`Unknown sentence type ${sessionSentenceType}`)
}
