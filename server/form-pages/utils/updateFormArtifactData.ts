import { FormArtifact } from '@approved-premises/ui'
import { getPageName, getTaskName, pageBodyShallowEquals } from '.'
import TasklistPage from '../tasklistPage'

export const updateFormArtifactData = <FormArtifactClass extends FormArtifact, CheckYourAnswersPageClass>(
  page: TasklistPage,
  formArtifact: FormArtifactClass,
  checkYourAnswersPageClass: CheckYourAnswersPageClass,
): FormArtifactClass => {
  const pageName = getPageName(page.constructor)
  const taskName = getTaskName(page.constructor)

  const oldBody = formArtifact.data?.[taskName]?.[pageName]

  formArtifact.data = formArtifact.data || {}
  formArtifact.data[taskName] = formArtifact.data[taskName] || {}
  formArtifact.data[taskName][pageName] = page.body

  const reviewTaskName = getTaskName(checkYourAnswersPageClass)
  const reviewPageName = getPageName(checkYourAnswersPageClass)

  if (formArtifact.data[reviewTaskName] && !(taskName === reviewTaskName && pageName === reviewPageName)) {
    if (!oldBody || !pageBodyShallowEquals(oldBody, page.body)) {
      delete formArtifact.data[reviewTaskName]
    }
  }

  return formArtifact
}
