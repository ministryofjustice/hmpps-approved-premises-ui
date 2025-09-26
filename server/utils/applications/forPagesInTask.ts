import { FormArtifact, UiTask } from '../../@types/ui'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getPage } from './getPage'
import TasklistPage from '../../form-pages/tasklistPage'

export const forPagesInTask = (
  formArtifact: FormArtifact,
  task: UiTask,
  callback: (page: TasklistPage, pageName: string) => void,
): void => {
  const pageNames = Object.keys(task.pages)
  let pageName = pageNames?.[0]

  const visited: Array<string> = []

  while (pageName && pageName !== 'check-your-answers') {
    if (visited.includes(pageName)) {
      throw new Error(
        `Page already visited while building task list: ${pageName}. Visited pages: ${visited.join(', ')}`,
      )
    }

    visited.push(pageName)
    pageNames.splice(pageNames.indexOf(pageName), 1)

    const Page = getPage(task.id, pageName, journeyTypeFromArtifact(formArtifact))
    const body = formArtifact?.data?.[task.id]?.[pageName]
    if (body) {
      const page = new Page(body, formArtifact)
      callback(page, pageName)
      pageName = page.next()
    } else if (pageNames.indexOf(pageName) + 1 < pageNames.length) {
      pageName = pageNames.at(pageNames.indexOf(pageName) + 1)
    } else {
      pageName = ''
    }
  }
}
