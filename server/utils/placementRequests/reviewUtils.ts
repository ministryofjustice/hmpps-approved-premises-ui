import { Cas1Application as Application, PlacementApplication } from '@approved-premises/api'
import { HtmlItem, SummaryListItem, TextItem } from '@approved-premises/ui'
import AdditionalDocuments from '../../form-pages/placement-application/request-a-placement/additionalDocuments'
import paths from '../../paths/placementApplications'
import { getDocumentSummaryListItems, summaryListItemForResponse } from '../applications/summaryListUtils'
import { getPage } from '../../form-pages/utils/getPage'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'
import { getResponseForPage } from '../applications/getResponseForPage'
import { embeddedSummaryListItemCompact } from '../applications/summaryListUtils/embeddedSummaryListItem'
import { summaryListItem } from '../formUtils'

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
  const placementPeriodRows: Array<SummaryListItem> = []
  if (placementApplication.requestedPlacementPeriod) {
    const { arrival, duration } = placementApplication.requestedPlacementPeriod
    placementPeriodRows.push(summaryListItem('Arrival date', arrival, 'date'))
    placementPeriodRows.push(summaryListItem('Placement duration', `${duration}`, 'duration'))
  }

  placementApplication.document['request-a-placement'].forEach((questions: Record<string, unknown>) => {
    const qDatesOfPlacement = 'Dates of placement'
    const qDateOfDecision = 'Enter the date of decision'

    Object.keys(questions).forEach(key => {
      if (key !== qDatesOfPlacement) {
        listItems.push({
          key: {
            text: key,
          },
          value:
            typeof questions[key] === 'string' || questions[key] instanceof String
              ? { text: questions[key] as string }
              : { html: embeddedSummaryListItemCompact(questions[key] as Array<Record<string, unknown>>) },
        })
      }
      if ([qDateOfDecision, qDatesOfPlacement].includes(key)) {
        listItems.push(...placementPeriodRows)
      }
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

  const response = getResponseForPage(placementApplication, 'request-a-placement', pageName)
  return Object.keys(response).map(key => {
    const value =
      typeof response[key] === 'string' || response[key] instanceof String
        ? ({ text: response[key] } as TextItem)
        : ({ html: embeddedSummaryListItemCompact(response[key] as Array<Record<string, unknown>>) } as HtmlItem)

    return summaryListItemForResponse(key, value, 'request-a-placement', pageName, placementApplication, true)
  })
}

export const attachDocumentsSummaryListItems = (
  placementApplication: PlacementApplication,
  application: Application,
  taskName: string,
  pageName: string,
  showActions: boolean,
) =>
  getDocumentSummaryListItems(
    retrieveQuestionResponseFromFormArtifact(placementApplication, AdditionalDocuments, 'selectedDocuments'),
    application.person.crn,
    showActions &&
      paths.placementApplications.pages.show({
        task: taskName,
        page: pageName,
        id: placementApplication.id,
      }),
    retrieveOptionalQuestionResponseFromFormArtifact(placementApplication, AdditionalDocuments, 'otherDocumentDetails'),
  )
