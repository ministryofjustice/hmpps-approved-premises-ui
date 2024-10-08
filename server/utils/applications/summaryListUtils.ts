import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
  Document,
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
import AttachDocuments from '../../form-pages/apply/add-documents/attachDocuments'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

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

/**
 * Return a list items from a document list for the check-your-answers page
 * @param documents list of documents to render
 * @param personCrn from application - used in document download path
 * @param changePath - if defined, adds a 'change' link
 * @param otherDocumentDetails - other documents text box contents
 */
export const getDocumentSummaryListItems = (
  documents: Array<Document>,
  personCrn: string,
  changePath: string,
  otherDocumentDetails: string,
): Array<SummaryListItem> => {
  const items: Array<SummaryListItem> = []

  const getAction = (visuallyHiddenText = '') =>
    changePath
      ? {
          actions: {
            items: [
              {
                href: changePath,
                text: 'Change',
                ...(visuallyHiddenText ? { visuallyHiddenText } : {}),
              },
            ],
          },
        }
      : {}

  documents.forEach(document => {
    const item: SummaryListItem = {
      key: {
        html: `<a href="/applications/people/${personCrn}/documents/${document.id}" data-cy-documentId="${document.id}">${document.fileName}</a>`,
      },
      value: { text: document?.description },
      ...getAction(document.fileName),
    }
    items.push(item)
  })
  if (otherDocumentDetails?.length)
    items.push({
      key: { text: 'Tell us about any other relevant documents' },
      value: { text: otherDocumentDetails },
      ...getAction(),
    })
  return items
}

const attachDocumentsSummaryListItems = (
  application: Application,
  task: UiTask,
  pageName: string,
  showActions: boolean,
) =>
  getDocumentSummaryListItems(
    documentsFromApplication(application),
    application.person.crn,
    showActions && applyPaths.applications.pages.show({ task: task.id, page: pageName, id: application.id }),
    retrieveOptionalQuestionResponseFromFormArtifact(application, AttachDocuments, 'otherDocumentDetails'),
  )

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
