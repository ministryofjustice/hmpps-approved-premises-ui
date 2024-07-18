import { BedSearchParametersUi } from '../@types/ui'
import { RestClientBuilder } from '../data'
import SpaceClient from '../data/spaceClient'
import { mapUiParamsForApi } from '../utils/matchUtils'

export default class SpaceService {
  constructor(private readonly spaceClientFactory: RestClientBuilder<SpaceClient>) {}

  async search(token: string, params: BedSearchParametersUi) {
    const spaceClient = this.spaceClientFactory(token)

    const spaces = await spaceClient.search(mapUiParamsForApi(params))
    return spaces
  }
}
