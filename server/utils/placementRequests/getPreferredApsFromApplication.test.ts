import { cas1PlacementRequestDetailFactory, premisesFactory } from '../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('getPreferredApsFromApplication', () => {
  const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

  it('should return a list of preferred APs', () => {
    const preferredAps = premisesFactory.buildList(3)
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(preferredAps)

    expect(getPreferredApsFromApplication(placementRequestDetail)).toEqual(preferredAps)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      placementRequestDetail.application,
      PreferredAps,
      'selectedAps',
    )
  })

  it('should return an empty list if no APs are specified', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(undefined)

    expect(getPreferredApsFromApplication(placementRequestDetail)).toEqual([])

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      placementRequestDetail.application,
      PreferredAps,
      'selectedAps',
    )
  })
})
