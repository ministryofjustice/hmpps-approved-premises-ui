import { applicationFactory } from '../../testutils/factories'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { calculatedPlacementDurationFromApplication } from './calculatedPlacementDurationFromApplication'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('calculatedPlacementDurationFromApplication', () => {
  const application = applicationFactory.build()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the default duration from the endpoint', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(12)

    expect(calculatedPlacementDurationFromApplication(application)).toEqual(12)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'defaultDurationDays',
    )
  })

  it('returns undefined if the duration could not be calculated', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(undefined)

    expect(calculatedPlacementDurationFromApplication(application)).toEqual(undefined)
  })
})
