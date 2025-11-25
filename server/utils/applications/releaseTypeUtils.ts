import { omit, pick } from 'underscore'
import { ReleaseTypeOptions } from '@approved-premises/ui'
import { ReleaseTypeOption, SentenceTypeOption } from '@approved-premises/api'

export const allReleaseTypes: ReleaseTypeOptions = {
  licence: 'Licence',
  rotl: 'Release on Temporary Licence (ROTL)',
  hdc: 'Home detention curfew (HDC)',
  pss: 'Post Sentence Supervision (PSS)',
  in_community: 'In Community',
  not_applicable: 'Not Applicable',
  extendedDeterminateLicence: 'Licence (Extended Determinate sentence)',
  paroleDirectedLicence: 'Licence (Parole directed)',
  reReleasedPostRecall: 'Re-released following standard recall',
  reReleasedFollowingFixedTermRecall: 'Re-released following fixed term recall',
}

export type ReleaseTypeLabel = (typeof allReleaseTypes)[ReleaseTypeOption]

export const standardDeterminateReleaseTypes = pick(allReleaseTypes, [
  'licence',
  'hdc',
  'pss',
  'rotl',
  'paroleDirectedLicence',
  'reReleasedPostRecall',
  'reReleasedFollowingFixedTermRecall',
])
export const extendedDeterminateReleaseTypes = pick(allReleaseTypes, [
  'rotl',
  'extendedDeterminateLicence',
  'paroleDirectedLicence',
])
export const lifeIppReleaseTypes = pick(allReleaseTypes, ['rotl', 'paroleDirectedLicence'])

export type PossibleReleaseTypeOptions =
  | typeof standardDeterminateReleaseTypes
  | typeof extendedDeterminateReleaseTypes
  | typeof lifeIppReleaseTypes
export type SelectableReleaseTypes = keyof PossibleReleaseTypeOptions

export type SentenceTypeResponse = Extract<
  SentenceTypeOption,
  'standardDeterminate' | 'extendedDeterminate' | 'ipp' | 'life'
>

export const selectableReleaseTypes = omit(allReleaseTypes, 'in_community')
