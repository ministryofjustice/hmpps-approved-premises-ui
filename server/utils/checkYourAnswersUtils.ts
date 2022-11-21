/* eslint-disable import/prefer-default-export */
import { Application } from '@approved-premises/api'
import { HtmlItem, SummaryListItem, Task, TextItem } from '@approved-premises/ui'
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
      const value =
        typeof response[key] === 'string' || response[key] instanceof String
          ? ({ text: response[key] } as TextItem)
          : ({ html: embeddedSummaryListItem(response[key] as Array<Record<string, unknown>>) } as HtmlItem)

      items.push(summaryListItemForResponse(key, value, task, pageName, application))
    })
  })

  return items
}

const embeddedSummaryListItem = (answers: Array<Record<string, unknown>>): string => {
  let response = ''

  answers.forEach(answer => {
    response += '<dl class="govuk-summary-list govuk-summary-list--embedded">'
    Object.keys(answer).forEach(key => {
      response += `
      <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
        <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
          ${key}
        </dt>
        <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
        ${answer[key]}
        </dd>
      </div>
      `
    })
    response += '</dl>'
  })

  return response
}

const summaryListItemForResponse = (
  key: string,
  value: TextItem | HtmlItem,
  task: Task,
  pageName: string,
  application: Application,
) => {
  return {
    key: {
      text: key,
    },
    value,
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

export { checkYourAnswersSections, embeddedSummaryListItem }
