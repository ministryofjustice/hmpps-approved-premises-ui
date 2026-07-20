import { createMock } from '@golevelup/ts-jest'
import { DataServices } from '@approved-premises/ui'
import { applicationFactory } from '../../testutils/factories'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { ApplicationService } from '../../services'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./getDefaultPlacementDurationInDays')

const applicationService = createMock<ApplicationService>({})
const dataServices = { applicationService } as DataServices
const token = 'test_token'

describe('placementDurationFromApplication', () => {
  const application = applicationFactory.build()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the duration if provided', async () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce(52)

    expect(await placementDurationFromApplication(application, dataServices, token)).toEqual(52)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(getDefaultPlacementDurationInDays).not.toHaveBeenCalled()
  })

  it('should return the default duration an alternative duration is not provided', async () => {
    ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValueOnce(undefined)
    ;(getDefaultPlacementDurationInDays as jest.Mock).mockReturnValueOnce(12)

    expect(await placementDurationFromApplication(application, dataServices, token)).toEqual(12)

    expect(retrieveOptionalQuestionResponseFromFormArtifact).toHaveBeenCalledWith(
      application,
      PlacementDuration,
      'duration',
    )
    expect(getDefaultPlacementDurationInDays).toHaveBeenCalledWith(application, dataServices, token)
  })
})
