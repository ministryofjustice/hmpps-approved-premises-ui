import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { getPageName, pageDataFromApplicationOrAssessment } from '../form-pages/utils'
import { SessionDataError } from './errors'
import { camelCase } from './utils'
import { FormArtifact } from '../@types/ui'

/**
 * Retrieves response for a given question from the application object or throws an error if it does not exist.
 * @param formArtifact the application or assessment to fetch the response from.
 * @param Page the page to retrieve the response from.
 * @param {string} question the question that we need the response for. Defaults to the camel-cased name of the `Page`.
 * @returns the response for the given Page/question.
 */
export const retrieveQuestionResponseFromFormArtifact = (
  formArtifact: FormArtifact,
  Page: unknown,
  question?: string,
) => {
  const pageData = pageDataFromApplicationOrAssessment(Page as TasklistPageInterface, formArtifact)
  const pageName = getPageName(Page as TasklistPage['constructor'])
  const q = question || camelCase(pageName)

  if (!pageData) {
    throw new SessionDataError(`Page data for question ${pageName} was not found in the session`)
  }

  const response = pageData[q]

  if (!response) {
    throw new SessionDataError(`Question ${q} was not found in the session`)
  }

  return response
}

/**
 * Retrieves response for a given question from the form artifact object or returns undefined if it does not exist.
 * @param formArtifact the form artifact to fetch the response from.
 * @param Page the page to retrieve the response from.
 * @param {string} question the question that we need the response for. Defaults to the camel-cased name of the `Page`.
 * @returns the response for the given page/question.
 */
export const retrieveOptionalQuestionResponseFromFormArtifact = (
  formArtifact: FormArtifact,
  Page: TasklistPageInterface,
  question?: string,
) => {
  let response

  try {
    response = retrieveQuestionResponseFromFormArtifact(formArtifact, Page, question)
  } catch (error) {
    response = undefined
  }

  return response
}
