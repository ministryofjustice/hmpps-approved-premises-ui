import { placementRequestDetailFactory, premisesFactory } from '../../testutils/factories'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('getPreferredApsFromApplication', () => {
  const placementRequestDetail = placementRequestDetailFactory.build()

  it('should return a list of preferred APs', () => {
    const preferredAps = premisesFactory.buildList(3)
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(preferredAps)

    expect(getPreferredApsFromApplication(placementRequestDetail)).toEqual(preferredAps)

    expect(retrieveOptionalQuestionResponseFromApplicationOrAssessment).toHaveBeenCalledWith(
      placementRequestDetail.application,
      PreferredAps,
      'selectedAps',
    )
  })

  it('should return an empty list if no APs are specified', () => {
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(undefined)

    expect(getPreferredApsFromApplication(placementRequestDetail)).toEqual([])

    expect(retrieveOptionalQuestionResponseFromApplicationOrAssessment).toHaveBeenCalledWith(
      placementRequestDetail.application,
      PreferredAps,
      'selectedAps',
    )
  })
})
