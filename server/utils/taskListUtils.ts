import { ApprovedPremisesApplication } from '../@types/shared'
import { JourneyType, Task } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import { previousTaskIsComplete } from './applicationUtils'

const taskLinkHelper = (task: Task, application: ApprovedPremisesApplication, journeyType?: JourneyType): string => {
  if (previousTaskIsComplete(task, application)) {
    const firstPage = Object.keys(task.pages)[0]

    const link =
      journeyType === 'assessments'
        ? assessPaths.assessments.pages.show({
            id: application.id,
            task: task.id,
            page: firstPage,
          })
        : applyPaths.applications.pages.show({
            id: application.id,
            task: task.id,
            page: firstPage,
          })

    return `<a href="${link}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
  }
  return task.title
}

export default taskLinkHelper
