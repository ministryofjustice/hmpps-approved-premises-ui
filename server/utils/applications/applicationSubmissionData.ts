import type {
  ApprovedPremisesApplication as Application,
  ReleaseTypeOption,
  SubmitApplication,
} from '@approved-premises/api'
import type { ApTypes } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'

import { retrieveOptionalQuestionResponseFromApplication, retrieveQuestionResponseFromApplication } from '../utils'

export const applicationSubmissionData = (application: Application): SubmitApplication => {
  const apType = retrieveQuestionResponseFromApplication<keyof ApTypes>(application, 'type-of-ap', 'ap-type', 'type')
  const targetLocation = retrieveQuestionResponseFromApplication<string>(
    application,
    'location-factors',
    'describe-location-factors',
    'postcodeArea',
  )
  const releaseType = retrieveOptionalQuestionResponseFromApplication<ReleaseTypeOption>(
    application,
    'basic-information',
    'release-type',
    'releaseType',
  )

  return {
    translatedDocument: application.document,
    isPipeApplication: apType === 'pipe',
    isWomensApplication: false,
    targetLocation,
    releaseType,
  }
}
