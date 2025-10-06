import ProviderClient from '../data/providerClient'
import ProviderService from './providerService'

jest.mock('../data/providerClient')

describe('ProviderService', () => {
  const providerClient = new ProviderClient(null) as jest.Mocked<ProviderClient>
  let providerService: ProviderService

  beforeEach(() => {
    providerService = new ProviderService(providerClient)
  })

  it('should call getTeams on the api client and return its result', async () => {
    const teams = {
      providers: [
        {
          id: 1001,
          code: 'XRT123',
          name: 'Team Lincoln',
        },
      ],
    }

    providerClient.getTeams.mockResolvedValue(teams)

    const result = await providerService.getTeams('some-provider-id', 'some-username')

    expect(providerClient.getTeams).toHaveBeenCalledTimes(1)
    expect(result).toEqual(teams)
  })
})
