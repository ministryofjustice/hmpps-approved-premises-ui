import { DataServices, JourneyType, TaskData, TasklistPage } from '@approved-premises/ui'
import { Cas1Application } from '@approved-premises/api'
import type { FormDataClient, RestClientBuilder } from '../data'

export default class FormDataService {
  constructor(private readonly formClientBuilder: RestClientBuilder<FormDataClient>) {}

  private getId(id: string, journey?: JourneyType): string {
    return journey ? `${id}-${journey}` : id
  }

  async getFormData(token: string, id: string, journey?: JourneyType): Promise<TaskData> {
    const formClient = this.formClientBuilder(token)

    try {
      return await formClient.get(this.getId(id, journey))
    } catch (error) {
      return {}
    }
  }

  async updateFormData(token: string, id: string, journey: JourneyType, formData: TaskData): Promise<{ id: string }> {
    const formClient = this.formClientBuilder(token)

    return formClient.update(this.getId(id, journey), formData)
  }

  async getPopulationData(
    token: string,
    application: Cas1Application,
    dataServices: DataServices,
    mapping: Record<string, string>,
  ) {
    const preFillImport = await dataServices.formDataService.getFormData(token, `prefill-${application.person.crn}`)
    return Object.entries(mapping).reduce(
      (obj, [inKey, outKey]) => {
        if (preFillImport[inKey]) obj[outKey] = preFillImport[inKey]
        return obj
      },
      {} as Record<string, string>,
    )
  }
}
