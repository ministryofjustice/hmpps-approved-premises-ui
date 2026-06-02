import { JourneyType, TaskData } from '@approved-premises/ui'
import { FormDataClient } from '../data'
import FormDataService from './formDataService'

jest.mock('../data/formDataClient.ts')

describe('formDataService', () => {
  const formDataClient = new FormDataClient(null) as jest.Mocked<FormDataClient>
  const formDataClientBuilder = jest.fn()
  const testData: TaskData = {}

  const service = new FormDataService(formDataClientBuilder)
  const token = 'TEST_TOKEN'
  const id = 'ID'
  const journey: JourneyType = 'profile'

  beforeEach(() => {
    jest.resetAllMocks()
    formDataClientBuilder.mockReturnValue(formDataClient)
  })

  describe('Get form data', () => {
    it('should get form data', async () => {
      formDataClient.get.mockResolvedValue(testData)

      const result = await service.getFormData(token, id, journey)

      expect(formDataClientBuilder).toHaveBeenCalledWith(token)
      expect(formDataClient.get).toHaveBeenCalledWith('ID-profile')
      expect(result).toEqual(testData)
    })
  })

  describe('Update form data', () => {
    it('should update form data', async () => {
      formDataClient.update.mockResolvedValue({ id })

      const result = await service.updateFormData(token, id, journey, testData)

      expect(formDataClientBuilder).toHaveBeenCalledWith(token)
      expect(formDataClient.update).toHaveBeenCalledWith('ID-profile', testData)
      expect(result).toEqual({ id })
    })
  })
})
