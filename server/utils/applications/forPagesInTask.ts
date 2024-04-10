import { FormArtifact, UiTask } from '../../@types/ui'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getPage } from './getPage'
import TasklistPage from '../../form-pages/tasklistPage'
import { FeatureFlags } from '../../services/featureFlagService'

export const forPagesInTask = (
  formArtifact: FormArtifact,
  task: UiTask,
  callback: (page: TasklistPage, pageName: string) => void,
  featureFlags: FeatureFlags,
): void => {
  const pageNames = Object.keys(task.pages)
  let pageName = pageNames?.[0]

  while (pageName && pageName !== 'check-your-answers') {
    const Page = getPage(task.id, pageName, journeyTypeFromArtifact(formArtifact))
    const body = formArtifact?.data?.[task.id]?.[pageName]

    if (body) {
      const page = new Page(body, formArtifact, featureFlags)
      callback(page, pageName)
      pageName = page.next()
    } else if (pageNames.indexOf(pageName) + 1 < pageNames.length) {
      pageName = pageNames.at(pageNames.indexOf(pageName) + 1)
    } else {
      pageName = ''
    }
  }
}
