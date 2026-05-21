import { TaskData } from '@approved-premises/ui'
import type { FormDataClient, RestClientBuilder } from '../data'

export default class FormDataService {
  constructor(private readonly formClientBuilder: RestClientBuilder<FormDataClient>) {}

  async getFormData(token: string, id: string): Promise<TaskData> {
    const formClient = this.formClientBuilder(token)

    return formClient.get(id)
  }

  async updateFormData(token: string, id: string, formData: TaskData): Promise<{ id: string }> {
    const formClient = this.formClientBuilder(token)

    return formClient.update(id, formData)
  }
}
