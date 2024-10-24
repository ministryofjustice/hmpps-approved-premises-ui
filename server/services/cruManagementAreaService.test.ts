import { Cas1ReferenceDataClient } from '../data'
import CruManagementAreaService from './cruManagementAreaService'
import { cruManagementAreaFactory } from '../testutils/factories'

jest.mock('../data/cas1ReferenceDataClient.ts')

describe('CruManagementAreaService', () => {
  const cas1ReferenceDataClient = new Cas1ReferenceDataClient(null) as jest.Mocked<Cas1ReferenceDataClient>
  const referenceDataClientFactory = jest.fn()

  const service = new CruManagementAreaService(referenceDataClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    referenceDataClientFactory.mockReturnValue(cas1ReferenceDataClient)
  })

  describe('getCruManagementAreas', () => {
    it('calls the getCruManagementAreas client method and returns the result', async () => {
      const cruManagementAreas = cruManagementAreaFactory.buildList(1)

      cas1ReferenceDataClient.getCruManagementAreas.mockResolvedValue(cruManagementAreas)

      const result = await service.getCruManagementAreas(token)

      expect(referenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getCruManagementAreas).toHaveBeenCalled()
      expect(result).toEqual(cruManagementAreas)
    })
  })
})
