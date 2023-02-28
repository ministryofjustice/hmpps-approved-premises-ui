import type { ApprovedPremisesApplication as Application, SubmitApplication } from '@approved-premises/api'
import type { ReleaseTypeID } from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
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
  const releaseType = retrieveOptionalQuestionResponseFromApplication<ReleaseTypeID>(
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
