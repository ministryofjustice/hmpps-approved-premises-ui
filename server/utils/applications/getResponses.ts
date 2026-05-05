import { FormArtifact, PageResponse } from '../../@types/ui'
import { forPagesInTask } from './forPagesInTask'
import { ApplicationOrAssessmentResponse } from './utils'
import { getSections } from '../../form-pages/utils/getPage'

export const getResponses = (formArtifact: FormArtifact): ApplicationOrAssessmentResponse => {
  const responses: Record<string, Array<PageResponse>> = {}

  const formSections = getSections(formArtifact)

  formSections.forEach(section => {
    section.tasks.forEach(task => {
      const responsesForTask: Array<PageResponse> = []

      forPagesInTask(formArtifact, task, page => responsesForTask.push(page.response()))

      responses[task.id] = responsesForTask
    })
  })

  return responses
}
