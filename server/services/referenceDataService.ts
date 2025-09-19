import { ProjectTypesDto } from '../@types/shared'
import ReferenceDataClient from '../data/referenceDataClient'

export default class ReferenceDataService {
  constructor(private readonly referenceDataClient: ReferenceDataClient) {}

  async getProjectTypes(userName: string): Promise<ProjectTypesDto> {
    return this.referenceDataClient.getProjectTypes(userName)
  }
}
