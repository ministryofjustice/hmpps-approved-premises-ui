import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import { FormArtifact, HtmlItem, SummaryListItem, TextItem, UiTask } from '@approved-premises/ui'

import applyPaths from '../../paths/apply'
import assessPaths from '../../paths/assess'
import placementApplicationsPaths from '../../paths/placementApplications'

import reviewSections from '../reviewUtils'
import { documentsFromApplication } from '../assessments/documentUtils'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { getResponseForPage } from './getResponseForPage'
import { forPagesInTask } from './forPagesInTask'
import { linebreaksToParagraphs } from '../utils'
import { embeddedSummaryListItem } from './summaryListUtils/embeddedSummaryListItem'

const summaryListSections = (applicationOrAssessment: Application | Assessment, showActions = true) =>
  reviewSections(applicationOrAssessment, taskResponsesAsSummaryListItems, showActions)

const taskResponsesAsSummaryListItems = (
  task: UiTask,
  applicationOrAssessment: Application | Assessment,
  showActions = true,
): Array<SummaryListItem> => {
  const items: Array<SummaryListItem> = []

  forPagesInTask(applicationOrAssessment, task, (_, pageName) => {
    if (pageName === 'attach-documents') {
      items.push(
        ...attachDocumentsSummaryListItems(applicationOrAssessment as Application, task, pageName, showActions),
      )
      return
    }

    const response = getResponseForPage(applicationOrAssessment, task.id, pageName)

    Object.keys(response).forEach(key => {
      try {
        const value =
          typeof response[key] === 'string' || response[key] instanceof String
            ? { html: linebreaksToParagraphs(response[key] as string) }
            : { html: embeddedSummaryListItem(response[key] as Array<Record<string, unknown>>) }

        items.push(summaryListItemForResponse(key, value, task.id, pageName, applicationOrAssessment, showActions))
      } catch (e) {
        throw Error(
          `Error rendering summary list. Page name: ${pageName}, response: ${JSON.stringify(response)}, question: ${key}, error: ${e}`,
        )
      }
    })
  })

  return items
}

const attachDocumentsSummaryListItems = (
  application: Application,
  task: UiTask,
  pageName: string,
  showActions: boolean,
) => {
  const items: Array<SummaryListItem> = []

  documentsFromApplication(application).forEach(document => {
    const item: SummaryListItem = {
      key: {
        html: `<a href="/applications/people/${application.person.crn}/documents/${document.id}" data-cy-documentId="${document.id}">${document.fileName}</a>`,
      },
      value: { text: document?.description || '' },
    }
    if (showActions) {
      item.actions = {
        items: [
          {
            href: applyPaths.applications.pages.show({ task: task.id, page: pageName, id: application.id }),
            text: 'Change',
            visuallyHiddenText: document.fileName,
          },
        ],
      }
    }
    items.push(item)
  })

  return items
}

export const summaryListItemForResponse = (
  key: string,
  value: TextItem | HtmlItem,
  taskName: string,
  pageName: string,
  formArtifact: FormArtifact,
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
          href: linkToPage(pageName, taskName, formArtifact),
          text: 'Change',
          visuallyHiddenText: key,
        },
      ],
    }
  }

  return item
}
const linkToPage = (pageName: string, taskName: string, formArtifact: FormArtifact) => {
  switch (journeyTypeFromArtifact(formArtifact)) {
    case 'assessments':
      return assessPaths.assessments.pages.show({ task: taskName, page: pageName, id: formArtifact.id })
    case 'applications':
      return applyPaths.applications.pages.show({ task: taskName, page: pageName, id: formArtifact.id })
    case 'placement-applications':
      return placementApplicationsPaths.placementApplications.pages.show({
        task: taskName,
        page: pageName,
        id: formArtifact.id,
      })
    default:
      throw Error('Unknown journey type')
  }
}

export { summaryListSections, taskResponsesAsSummaryListItems }
