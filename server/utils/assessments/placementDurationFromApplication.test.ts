import { applicationFactory } from '../../testutils/factories'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from '../applications/getDefaultPlacementDurationInDays'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/getDefaultPlacementDurationInDays')

describe('placementDurationFromApplication', () => {
  const application = applicationFactory.build()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the duration if provided', () => {
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce(52)

    expect(placementDurationFromApplication(application)).toEqual(52)

    expect(retrieveOptionalQuestionResponseFromApplicationOrAssessment).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(getDefaultPlacementDurationInDays).not.toHaveBeenCalled()
  })

  it('should return the default duration an alternative duration is not provided', () => {
    ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce(undefined)
    ;(getDefaultPlacementDurationInDays as jest.Mock).mockReturnValueOnce(12)

    expect(placementDurationFromApplication(application)).toEqual(12)

    expect(retrieveOptionalQuestionResponseFromApplicationOrAssessment).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(getDefaultPlacementDurationInDays).toHaveBeenCalledWith(application)
  })
})
