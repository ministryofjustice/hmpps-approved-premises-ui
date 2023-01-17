import type { FormSections, FormSection } from '@approved-premises/ui'
import { ApprovedPremisesApplication as Application, ApprovedPremisesAssessment as Assessment } from '../@types/shared'
import { JourneyType, Task } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import Apply from '../form-pages/apply'

const taskIds = Object.keys(Apply.pages)

const taskIsComplete = (task: Task, applicationOrAssessment: Application | Assessment): boolean => {
  return applicationOrAssessment.data?.[task.id]
}

const previousTaskIsComplete = (task: Task, applicationOrAssessment: Application | Assessment): boolean => {
  const previousTaskId = taskIds[taskIds.indexOf(task.id) - 1]
  return previousTaskId ? applicationOrAssessment.data?.[previousTaskId] : true
}

const getTaskStatus = (task: Task, applicationOrAssessment: Application | Assessment): string => {
  if (!taskIsComplete(task, applicationOrAssessment) && !previousTaskIsComplete(task, applicationOrAssessment)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Cannot start yet</strong>`
  }

  if (!taskIsComplete(task, applicationOrAssessment) && previousTaskIsComplete(task, applicationOrAssessment)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Not started</strong>`
  }

  return `<strong class="govuk-tag app-task-list__tag" id="${task.id}-status">Completed</strong>`
}

const getCompleteSectionCount = (sections: FormSections, applicationOrAssessment: Application | Assessment): number => {
  return sections.filter((section: FormSection) => {
    return (
      section.tasks.filter((task: Task) => taskIsComplete(task, applicationOrAssessment)).length ===
      section.tasks.length
    )
  }).length
}

const taskLink = (task: Task, applicationOrAssessment: Application | Assessment, journeyType?: JourneyType): string => {
  if (previousTaskIsComplete(task, applicationOrAssessment)) {
    const firstPage = Object.keys(task.pages)[0]

    const link =
      journeyType === 'assessments'
        ? assessPaths.assessments.pages.show({
            id: applicationOrAssessment.id,
            task: task.id,
            page: firstPage,
          })
        : applyPaths.applications.pages.show({
            id: applicationOrAssessment.id,
            task: task.id,
            page: firstPage,
          })

    return `<a href="${link}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
  }
  return task.title
}

export { taskLink, getCompleteSectionCount, getTaskStatus, previousTaskIsComplete, taskIsComplete }
