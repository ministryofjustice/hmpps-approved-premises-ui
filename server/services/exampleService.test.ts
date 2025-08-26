import CommunityPaybackApiClient from '../data/communityPaybackApiClient'
import ExampleService from './exampleService'

jest.mock('../data/communityPaybackApiClient')

describe('ExampleService', () => {
  const communityPaybackApiClient = new CommunityPaybackApiClient(null) as jest.Mocked<CommunityPaybackApiClient>
  let exampleService: ExampleService

  beforeEach(() => {
    exampleService = new ExampleService(communityPaybackApiClient)
  })

  it('should call getExampleData on the api client and return its result', async () => {
    const expectedData = 'example data'

    communityPaybackApiClient.getExampleData.mockResolvedValue(expectedData)

    const result = await exampleService.getExampleData()

    expect(communityPaybackApiClient.getExampleData).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedData)
  })
})
