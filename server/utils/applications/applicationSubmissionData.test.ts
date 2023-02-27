import type { ReleaseTypeID } from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'

import applicationFactory from '../../testutils/factories/application'
import { applicationSubmissionData } from './applicationSubmissionData'

describe('applicationSubmissionData', () => {
  const postcodeArea = 'ABC 123'
  const releaseType = 'license' as ReleaseTypeID

  it('returns the correct data for a pipe application', () => {
    const application = applicationFactory
      .withApType('pipe')
      .withPostcodeArea(postcodeArea)
      .withReleaseType(releaseType)
      .build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: true,
      isWomensApplication: false,
      releaseType,
      targetLocation: postcodeArea,
    })
  })

  it('returns the correct data for a non-pipe application', () => {
    const application = applicationFactory
      .withApType('standard')
      .withPostcodeArea(postcodeArea)
      .withReleaseType(releaseType)
      .build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: false,
      isWomensApplication: false,
      releaseType,
      targetLocation: postcodeArea,
    })
  })

  it('handles when a release type is missing', () => {
    const application = applicationFactory.withApType('standard').withPostcodeArea(postcodeArea).build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: false,
      isWomensApplication: false,
      releaseType: undefined,
      targetLocation: postcodeArea,
    })
  })
})
