import { applicationFactory } from '../../testutils/factories'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./getDefaultPlacementDurationInDays')

describe('placementDurationFromApplication', () => {
  const application = applicationFactory.build({ duration: undefined })

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

  it('should return the default duration an override duration is not provided', () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockImplementation((_, __, question?: string) => {
      if (question === 'defaultDurationDays') return 12
      return undefined
    })

    expect(placementDurationFromApplication(application)).toEqual(12)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'defaultDurationDays',
    )
  })

  it('should return the duration from the application body. if populated', () => {
    const submittedApplication = applicationFactory.build({ duration: 80 })

    expect(placementDurationFromApplication(submittedApplication)).toEqual(80)
    expect(retrieveOptionalQuestionResponseFromFormArtifact).not.toHaveBeenCalled()
  })
})
