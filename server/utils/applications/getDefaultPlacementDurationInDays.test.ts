import { createMock } from '@golevelup/ts-jest'
import { DataServices } from '@approved-premises/ui'
import {
  applicationFactory,
  cas1RequestsForPlacementDurationsCalculationResponseDtoFactory,
} from '../../testutils/factories'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'
import { ApplicationService } from '../../services'
import { isExceptionalCase } from './utils'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
const applicationService = createMock<ApplicationService>({})
const dataServices = { applicationService } as DataServices

const token = 'test_token'

describe('getDefaultPlacementDurationInDays', () => {
  const application = applicationFactory.build({
    data: { 'basic-information': { 'sentence-type': { sentenceType: 'sentence-type' } } },
  })
  const durations = cas1RequestsForPlacementDurationsCalculationResponseDtoFactory.build()
  applicationService.getPlacementDuration.mockResolvedValue(durations)

  it('calls the api to calculate the default placement duration', async () => {
    expect(await getDefaultPlacementDurationInDays(application, dataServices, token)).toEqual(durations)
    expect(applicationService.getPlacementDuration).toHaveBeenCalledWith(
      token,
      application.id,
      application.apType,
      'sentence-type',
      isExceptionalCase(application),
    )
  })
})
