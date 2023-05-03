import { ApprovedPremisesApplication } from '@approved-premises/api'
import { HtmlItem, SummaryListItem, TextItem, UiTask } from '@approved-premises/ui'

import applyPaths from '../../paths/apply'
import assessPaths from '../../paths/assess'

import { getResponseForPage } from './utils'
import reviewSections from '../reviewUtils'
import isAssessment from '../assessments/isAssessment'

const summaryListSections = (application: ApprovedPremisesApplication, showActions = true) =>
  reviewSections(application, getTaskResponsesAsSummaryListItems, showActions)

export const getTaskResponsesAsSummaryListItems = (
  task: UiTask,
  application: ApprovedPremisesApplication,
  showActions: boolean,
): Array<SummaryListItem> => {
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

      items.push(summaryListItemForResponse(key, value, task, pageName, application, showActions))
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
  task: UiTask,
  pageName: string,
  applicationOrAssessment: Application | Assessment,
  showActions: boolean,
): SummaryListItem => {
  const item = {
    key: {
      text: key,
    },
    value,
  } as SummaryListItem

  if (showActions) {
    item.actions = {
      items: [
        {
          href: isAssessment(applicationOrAssessment)
            ? assessPaths.assessments.pages.show({ task: task.id, page: pageName, id: applicationOrAssessment.id })
            : applyPaths.applications.pages.show({ task: task.id, page: pageName, id: applicationOrAssessment.id }),
          text: 'Change',
          visuallyHiddenText: key,
        },
      ],
    }
  }

  return item
}

export { summaryListSections, embeddedSummaryListItem }
