import { TaskData } from '@approved-premises/ui'
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

  beforeEach(() => {
    jest.resetAllMocks()
    formDataClientBuilder.mockReturnValue(formDataClient)
  })

  describe('Get form data', () => {
    it('should get form data', async () => {
      formDataClient.get.mockResolvedValue(testData)

      const result = await service.getFormData(token, id)

      expect(formDataClientBuilder).toHaveBeenCalledWith(token)
      expect(formDataClient.get).toHaveBeenCalledWith(id)
      expect(result).toEqual(testData)
    })
  })

  describe('Update form data', () => {
    it('should update form data', async () => {
      formDataClient.update.mockResolvedValue({ id })

      const result = await service.updateFormData(token, id, testData)

      expect(formDataClientBuilder).toHaveBeenCalledWith(token)
      expect(formDataClient.update).toHaveBeenCalledWith(id, testData)
      expect(result).toEqual({ id })
    })
  })
})
