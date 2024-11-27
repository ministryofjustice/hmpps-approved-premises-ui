import { ReleaseTypeOptions } from '@approved-premises/ui'
import { ReleaseTypeOption } from '@approved-premises/api'

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
