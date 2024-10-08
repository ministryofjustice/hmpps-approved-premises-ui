import { Cas1ReferenceDataClient } from '../data'
import CRUManagementAreaService from './cruManagementAreaService'
import { cruManagementAreaFactory } from '../testutils/factories'

jest.mock('../data/cas1ReferenceDataClient.ts')

describe('CRUManagementAreaService', () => {
  const cas1ReferenceDataClient = new Cas1ReferenceDataClient(null) as jest.Mocked<Cas1ReferenceDataClient>
  const referenceDataClientFactory = jest.fn()

  const service = new CRUManagementAreaService(referenceDataClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    referenceDataClientFactory.mockReturnValue(cas1ReferenceDataClient)
  })

  describe('getCRUManagementAreas', () => {
    it('calls the getCRUManagementAreas client method and returns the result', async () => {
      const cruManagementAreas = cruManagementAreaFactory.buildList(1)

      cas1ReferenceDataClient.getCRUManagementAreas.mockResolvedValue(cruManagementAreas)

      const result = await service.getCRUManagementAreas(token)

      expect(referenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getCRUManagementAreas).toHaveBeenCalled()
      expect(result).toEqual(cruManagementAreas)
    })
  })
})
