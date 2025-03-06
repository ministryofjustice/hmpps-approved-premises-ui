import { FormArtifact, PageResponse, TaskNames } from '../../@types/ui'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getPage } from './getPage'

export const getResponseForPage = (formArtifact: FormArtifact, taskName: TaskNames, pageName: string): PageResponse => {
  const Page = getPage(taskName, pageName, journeyTypeFromArtifact(formArtifact))

  const body = formArtifact?.data?.[taskName]?.[pageName]
  const page = new Page(body, formArtifact)

  return page.response()
}
