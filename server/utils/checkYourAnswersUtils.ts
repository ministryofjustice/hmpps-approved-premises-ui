/* eslint-disable import/prefer-default-export */
import { Application } from '@approved-premises/api'
import { SummaryListItem, Task } from '@approved-premises/ui'
import { sections } from '../form-pages/apply'
import paths from '../paths/apply'

import { getResponseForPage } from './applicationUtils'

const checkYourAnswersSections = (application: Application) => {
  const nonCheckYourAnswersSections = sections.slice(0, -1)

  return nonCheckYourAnswersSections.map(section => {
    return {
      title: section.title,
      tasks: section.tasks.map(task => {
        return {
          id: task.id,
          rows: getTaskResponsesAsSummaryListItems(task, application),
        }
      }),
    }
  })
}

const getTaskResponsesAsSummaryListItems = (task: Task, application: Application): Array<SummaryListItem> => {
  const items: Array<SummaryListItem> = []

  if (!application.data[task.id]) {
    return items
  }

  const pageNames = Object.keys(application.data[task.id])

  pageNames.forEach(pageName => {
    const response = getResponseForPage(application, task.id, pageName)

    Object.keys(response).forEach(key => {
      items.push(summaryListItemForResponse(key, response[key], task, pageName, application))
    })
  })

  return items
}

const summaryListItemForResponse = (
  key: string,
  value: string,
  task: Task,
  pageName: string,
  application: Application,
) => {
  return {
    key: {
      text: key,
    },
    value: {
      text: value,
    },
    actions: {
      items: [
        {
          href: paths.applications.pages.show({ task: task.id, page: pageName, id: application.id }),
          text: 'Change',
          visuallyHiddenText: key,
        },
      ],
    },
  }
}

export { checkYourAnswersSections }
