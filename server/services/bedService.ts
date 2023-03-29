import { BedSearchParametersUi } from '../@types/ui'
import { RestClientBuilder } from '../data'
import BedClient from '../data/bedClient'
import { mapUiParamsForApi } from '../utils/matchUtils'

export default class BedService {
  constructor(private readonly bedClientFactory: RestClientBuilder<BedClient>) {}

  async search(token: string, params: BedSearchParametersUi) {
    const bedClient = this.bedClientFactory(token)

    const beds = await bedClient.search(mapUiParamsForApi(params))
    return beds
  }
}
