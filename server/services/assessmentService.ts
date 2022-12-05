import type { GroupedAssessment } from '@approved-premises/ui'

import type { RestClientBuilder, AssessmentClient } from '../data'

export default class AssessmentService {
  constructor(private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>) {}

  async getAllForLoggedInUser(token: string): Promise<GroupedAssessment> {
    const client = this.assessmentClientFactory(token)

    const result = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessment
    const assessments = await client.all()

    assessments.forEach(assessment =>
      assessment.decision ? result.completed.push(assessment) : result.awaiting.push(assessment),
    )

    return result
  }
}
