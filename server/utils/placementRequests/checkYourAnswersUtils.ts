import { ApprovedPremisesApplication as Application, Document, PlacementApplication } from '../../@types/shared'
import { HtmlItem, SummaryListItem, TextItem } from '../../@types/ui'
import AdditionalDocuments from '../../form-pages/placement-application/request-a-placement/additionalDocuments'
import paths from '../../paths/placementApplications'
import { summaryListItemForResponse } from '../applications/summaryListUtils'
import { getPage } from '../applications/getPage'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { getResponseForPage } from '../applications/getResponseForPage'
import { datesOfPlacementItem } from './datesOfPlacementItem'
import { embeddedSummaryListItem } from '../applications/summaryListUtils/embeddedSummaryListItem'

export const mapPageForSummaryList = (
  placementApplication: PlacementApplication,
  pageName: string,
  application: Application,
) => {
  return {
    card: {
      title: { text: getPageTitle(placementApplication, pageName) },
    },
    rows: pageResponsesAsSummaryListItems(placementApplication, pageName, application),
  }
}

export const getPageTitle = (placementApplication: PlacementApplication, pageName: string) => {
  const Page = getPage('request-a-placement', pageName, 'placement-applications')
  return new Page(placementApplication.data?.['request-a-placement'][pageName], placementApplication).title
}

export const placementApplicationQuestionsForReview = (placementApplication: PlacementApplication) => {
  return {
    card: {
      title: { text: 'Placement application information' },
    },
    rows: placementApplicationResponsesAsSummaryListItems(placementApplication),
  }
}

const placementApplicationResponsesAsSummaryListItems = (placementApplication: PlacementApplication) => {
  const listItems: Array<SummaryListItem> = []
  ;(
    placementApplication.document['request-a-placement'] as Array<
      Record<string, string | Array<Record<string, string>>>
    >
  ).forEach(questions => {
    const keys = Object.keys(questions)
    keys.forEach(key => {
      if (key === 'Dates of placement' && placementApplication?.placementDates?.length) {
        listItems.push({
          key: {
            text: key,
          },
          value: {
            html: embeddedSummaryListItem(
              placementApplication.placementDates.map(placementDate => {
                return datesOfPlacementItem(placementDate.duration, placementDate.expectedArrival)
              }),
            ),
          } as HtmlItem,
        })
        return
      }

      listItems.push({
        key: {
          text: key,
        },
        value:
          typeof questions[key] === 'string' || questions[key] instanceof String
            ? { text: questions[key] as string }
            : { html: embeddedSummaryListItem(questions[key] as Array<Record<string, unknown>>) },
      })
    })
  })
  return listItems
}

export const pageResponsesAsSummaryListItems = (
  placementApplication: PlacementApplication,
  pageName: string,
  application: Application,
) => {
  if (pageName === 'additional-documents') {
    return attachDocumentsSummaryListItems(placementApplication, application, 'request-a-placement', pageName, true)
  }

  if (pageName === 'dates-of-placement') {
    if (placementApplication?.placementDates?.length) {
      return [
        summaryListItemForResponse(
          'Dates of placement',
          {
            html: embeddedSummaryListItem(
              placementApplication.placementDates.map(placementDate => {
                return datesOfPlacementItem(placementDate.duration, placementDate.expectedArrival)
              }),
            ),
          } as HtmlItem,
          'request-a-placement',
          'dates-of-placement',
          placementApplication,
          true,
        ),
      ]
    }
  }

  const response = getResponseForPage(placementApplication, 'request-a-placement', pageName)
  return Object.keys(response).map(key => {
    const value =
      typeof response[key] === 'string' || response[key] instanceof String
        ? ({ text: response[key] } as TextItem)
        : ({ html: embeddedSummaryListItem(response[key] as Array<Record<string, unknown>>) } as HtmlItem)

    return summaryListItemForResponse(key, value, 'request-a-placement', pageName, placementApplication, true)
  })
}

export const attachDocumentsSummaryListItems = (
  placementApplication: PlacementApplication,
  application: Application,
  taskName: string,
  pageName: string,
  showActions: boolean,
) => {
  const items: Array<SummaryListItem> = []

  const documents = retrieveQuestionResponseFromFormArtifact(
    placementApplication,
    AdditionalDocuments,
    'selectedDocuments',
  ) as Array<Document>

  documents.forEach(document => {
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
            href: paths.placementApplications.pages.show({ task: taskName, page: pageName, id: application.id }),
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
