import { omit } from 'underscore'
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
  reReleasedPostRecall: 'Re-released post recall',
}

export type ReleaseTypeLabel = (typeof allReleaseTypes)[ReleaseTypeOption]

export type SelectableReleaseTypes = keyof PossibleReleaseTypeOptions
export type ExtendedDetermindateReleaseTypeOptions = Pick<
  ReleaseTypeOptions,
  'rotl' | 'extendedDeterminateLicence' | 'paroleDirectedLicence'
>
type StandardDeterminateReleaseTypeOptions = Pick<
  ReleaseTypeOptions,
  'licence' | 'paroleDirectedLicence' | 'rotl' | 'hdc' | 'pss'
>
type LifeIppReleaseTypeOptions = Pick<ReleaseTypeOptions, 'rotl' | 'paroleDirectedLicence'>
export type PossibleReleaseTypeOptions =
  | ExtendedDetermindateReleaseTypeOptions
  | StandardDeterminateReleaseTypeOptions
  | LifeIppReleaseTypeOptions

export type SentenceTypeResponse = Extract<
  SentenceTypeOption,
  'standardDeterminate' | 'extendedDeterminate' | 'ipp' | 'life'
>

export const selectableReleaseTypes = omit(allReleaseTypes, 'in_community')
