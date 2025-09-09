import CommunityPaybackApiClient from '../data/communityPaybackApiClient'

export default class ExampleService {
  constructor(private readonly communityPaybackApiClient: CommunityPaybackApiClient) {}

  getExampleData(username: string) {
    return this.communityPaybackApiClient.getExampleData(username)
  }
}
