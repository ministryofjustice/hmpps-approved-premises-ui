import { ApprovedPremisesApplication as Application } from '../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { startDateOutsideOfNationalStandardsTimescales } from './startDateOutsideOfNationalStandardsTimescales'
import ReasonForShortNotice from '../../form-pages/apply/reasons-for-placement/basic-information/reasonForShortNotice'

export const reasonForShortNoticeDetails = (
  application: Application,
): {
  reasonForShortNotice: string
  reasonForShortNoticeOther: string
} => {
  const startDateOutsideOfTimescales = startDateOutsideOfNationalStandardsTimescales(application)
  let reasonForShortNotice
  let reasonForShortNoticeOther
  if (startDateOutsideOfTimescales) {
    reasonForShortNotice = retrieveOptionalQuestionResponseFromFormArtifact(application, ReasonForShortNotice, 'reason')
    reasonForShortNoticeOther = retrieveOptionalQuestionResponseFromFormArtifact(
      application,
      ReasonForShortNotice,
      'other',
    )
  }
  return { reasonForShortNotice, reasonForShortNoticeOther }
}
