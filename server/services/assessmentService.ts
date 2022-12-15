import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { GroupedAssessments } from '@approved-premises/ui'

import type { RestClientBuilder, AssessmentClient } from '../data'

export default class AssessmentService {
  constructor(private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>) {}

  async getAllForLoggedInUser(token: string): Promise<GroupedAssessments> {
    const client = this.assessmentClientFactory(token)

    const result = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessments
    const assessments = await client.all()

    await Promise.all(
      assessments.map(async assessment => {
        return assessment.decision ? result.completed.push(assessment) : result.awaiting.push(assessment)
      }),
    )

    return result
  }

  async findAssessment(token: string, id: string): Promise<Assessment> {
    const client = this.assessmentClientFactory(token)
    const assessment = await client.find(id)

    return assessment
  }
}
