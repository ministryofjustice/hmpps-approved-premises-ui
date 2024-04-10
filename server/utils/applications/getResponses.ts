import { FormArtifact, PageResponse } from '../../@types/ui'
import { FeatureFlags } from '../../services/featureFlagService'
import { forPagesInTask } from './forPagesInTask'
import { ApplicationOrAssessmentResponse, getSections } from './utils'

export const getResponses = (
  formArtifact: FormArtifact,
  featureFlags: FeatureFlags,
): ApplicationOrAssessmentResponse => {
  const responses = {}

  const formSections = getSections(formArtifact)

  formSections.forEach(section => {
    section.tasks.forEach(task => {
      const responsesForTask: Array<PageResponse> = []

      forPagesInTask(formArtifact, task, page => responsesForTask.push(page.response()), featureFlags)

      responses[task.id] = responsesForTask
    })
  })

  return responses
}
