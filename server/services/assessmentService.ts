import { Assessment } from '@approved-premises/api'
import type { AssessmentWithRisks, GroupedAssessmentWithRisks } from '@approved-premises/ui'

import type { RestClientBuilder, AssessmentClient, PersonClient } from '../data'

export default class AssessmentService {
  constructor(
    private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>,
    private readonly personClientFactory: RestClientBuilder<PersonClient>,
  ) {}

  async getAllForLoggedInUser(token: string): Promise<GroupedAssessmentWithRisks> {
    const client = this.assessmentClientFactory(token)
    const personClient = this.personClientFactory(token)

    const result = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessmentWithRisks
    const assessments = await client.all()

    await Promise.all(
      assessments.map(async assessment => {
        const risks = await personClient.risks(assessment.application.person.crn)
        const assessmentWithRisks = {
          ...assessment,
          application: { ...assessment.application, person: { ...assessment.application.person, risks } },
        } as AssessmentWithRisks
        return assessment.decision
          ? result.completed.push(assessmentWithRisks)
          : result.awaiting.push(assessmentWithRisks)
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
