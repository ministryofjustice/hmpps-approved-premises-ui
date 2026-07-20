import { FormArtifact, UiTask } from '../../@types/ui'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getPage } from '../../form-pages/utils/getPage'
import TasklistPage from '../../form-pages/tasklistPage'

export const forPagesInTask = (
  formArtifact: FormArtifact,
  task: UiTask,
  callback: (page: TasklistPage, pageName: string) => void,
): void => {
  const pageNames = Object.keys(task.pages)

  // find the first page that has been populated
  let pageName = pageNames.find(name => !!formArtifact?.data?.[task.id]?.[name])

  const visited: Array<string> = []

  while (pageName && pageName !== 'check-your-answers') {
    // If the page has not been visited yet, process and add to visited list
    if (!visited.includes(pageName)) {
      visited.push(pageName)
      pageNames.splice(pageNames.indexOf(pageName), 1)

      const body = formArtifact?.data?.[task.id]?.[pageName]
      if (body) {
        const Page = getPage(task.id, pageName, journeyTypeFromArtifact(formArtifact))
        const page = new Page(body, formArtifact)
        callback(page, pageName)
        pageName = page.next()
      } else {
        // Once we start on populated pages, if we hit an unpopulated one, that is where the user is up to, so stop rendering
        pageName = pageNames[pageNames.indexOf(pageName) + 1]
      }
    } else {
      // If we hit a visited page, we have looped back, so we've rendered all the pages possible
      pageName = ''
    }
  }
}
