import ReferenceDataClient from '../data/referenceDataClient'
import ReferenceDataService from './referenceDataService'

jest.mock('../data/referenceDataClient')

describe('ReferenceDataService', () => {
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  let referenceDataService: ReferenceDataService

  beforeEach(() => {
    referenceDataService = new ReferenceDataService(referenceDataClient)
  })

  it('should call getProjectTypes on the api client and return its result', async () => {
    const projectTypes = {
      projectTypes: [
        {
          id: '1001',
          name: 'Team Lincoln',
          code: '12',
        },
      ],
    }

    referenceDataClient.getProjectTypes.mockResolvedValue(projectTypes)

    const result = await referenceDataService.getProjectTypes('some-username')

    expect(referenceDataClient.getProjectTypes).toHaveBeenCalledTimes(1)
    expect(result).toEqual(projectTypes)
  })

  it('should call getEnforcementActions on the api client and return its result', async () => {
    const enforcementActions = {
      enforcementActions: [
        {
          id: '1001',
          name: 'Team Lincoln',
          code: '12',
        },
      ],
    }

    referenceDataClient.getEnforcementActions.mockResolvedValue(enforcementActions)

    const result = await referenceDataService.getEnforcementActions('some-username')

    expect(referenceDataClient.getEnforcementActions).toHaveBeenCalledTimes(1)
    expect(result).toEqual(enforcementActions)
  })
})
