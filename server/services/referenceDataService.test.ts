import { ReferenceDataClient } from '../data'
import ReferenceDataService from './referenceDataService'

jest.mock('../data/referenceDataClient.ts')

describe('ApAreaService', () => {
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const referenceDataClientFactory = jest.fn()

  const service = new ReferenceDataService(referenceDataClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getTiers', () => {
    it('calls the getTiers client method and maps the result to an array of plain strings', async () => {
      const tiersFromApi = [{ tier: 'T1' }, { tier: 'T2' }, { tier: 'T3' }]

      referenceDataClient.getTiers.mockResolvedValue(tiersFromApi)

      const result = await service.getTiers(token)

      expect(referenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getTiers).toHaveBeenCalled()
      expect(result).toEqual(['T1', 'T2', 'T3'])
    })
  })
})
