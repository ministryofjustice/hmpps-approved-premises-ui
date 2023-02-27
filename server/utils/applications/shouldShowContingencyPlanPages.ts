import { ApprovedPremisesApplication as Application } from '../../@types/shared'
import { ReleaseTypeID } from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import { retrieveQuestionResponseFromApplication } from '../utils'

export const shouldShowContingencyPlanPages = (application: Application) => {
  let releaseType: ReleaseTypeID
  const sentenceType = retrieveQuestionResponseFromApplication(
    application,
    'basic-information',
    'sentence-type',
    'sentenceType',
  )

  if (
    sentenceType === 'standardDeterminate' ||
    sentenceType === 'extendedDeterminate' ||
    sentenceType === 'ipp' ||
    sentenceType === 'life'
  ) {
    releaseType = retrieveQuestionResponseFromApplication(
      application,
      'basic-information',
      'release-type',
      'releaseType',
    )
  }

  const apType = retrieveQuestionResponseFromApplication(application, 'type-of-ap', 'ap-type', 'apType')

  if (
    sentenceType === 'communityOrder' ||
    sentenceType === 'nonStatutory' ||
    releaseType === 'pss' ||
    apType === 'esap'
  )
    return true

  return false
}
