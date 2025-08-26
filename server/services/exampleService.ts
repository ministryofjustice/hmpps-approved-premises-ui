import CommunityPaybackApiClient from '../data/communityPaybackApiClient'

export default class ExampleService {
  constructor(private readonly communityPaybackApiClient: CommunityPaybackApiClient) {}

  getExampleData() {
    return this.communityPaybackApiClient.getExampleData()
  }
}
