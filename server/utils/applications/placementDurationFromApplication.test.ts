import { applicationFactory } from '../../testutils/factories'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./getDefaultPlacementDurationInDays')

describe('placementDurationFromApplication', () => {
  const application = applicationFactory.build()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the duration if provided', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce(52)

    expect(placementDurationFromApplication(application)).toEqual(52)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(getDefaultPlacementDurationInDays).not.toHaveBeenCalled()
  })

  it('should return the default duration an alternative duration is not provided', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce(undefined)
    ;(getDefaultPlacementDurationInDays as jest.Mock).mockReturnValueOnce(12)

    expect(placementDurationFromApplication(application)).toEqual(12)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(getDefaultPlacementDurationInDays).toHaveBeenCalledWith(application)
  })
})
