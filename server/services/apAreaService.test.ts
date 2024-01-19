import { ReferenceDataClient } from '../data'
import ApAreaService from './apAreaService'
import { apAreaFactory } from '../testutils/factories/referenceData'

jest.mock('../data/referenceDataClient.ts')

describe('ApAreaService', () => {
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const referenceDataClientFactory = jest.fn()

  const service = new ApAreaService(referenceDataClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getApAreas', () => {
    it('calls the getApAreas client method and returns the result', async () => {
      const apAreas = apAreaFactory.buildList(1)

      referenceDataClient.getApAreas.mockResolvedValue(apAreas)

      const result = await service.getApAreas(token)

      expect(referenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getApAreas).toHaveBeenCalled()
      expect(result).toEqual(apAreas)
    })
  })
})
