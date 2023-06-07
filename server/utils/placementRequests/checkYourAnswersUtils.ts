import { PlacementApplication } from '../../@types/shared'
import { HtmlItem, TextItem } from '../../@types/ui'
import PlacementRequest from '../../form-pages/placement-application'
import { embeddedSummaryListItem, summaryListItemForResponse } from '../applications/summaryListUtils'

import { getPage, getResponseForPage } from '../applications/utils'

export const mapPageForSummaryList = (placementApplication: PlacementApplication, pageName: string) => {
  return {
    card: {
      title: { text: getPageTitle(placementApplication, pageName) },
    },
    rows: pageResponsesAsSummaryListItems(placementApplication, pageName),
  }
}

export const getPageTitle = (placementApplication: PlacementApplication, pageName: string) => {
  const Page = getPage('request-a-placement', pageName, 'placement-applications')
  return new Page(placementApplication.data?.['request-a-placement'][pageName], placementApplication).title
}

export const pagesForReview = () => {
  const task = PlacementRequest.sections.map(section => section.tasks).flat()[0]
  return Object.keys(task.pages).filter(page => page !== 'check-your-answers')
}

export const pageResponsesAsSummaryListItems = (placementApplication: PlacementApplication, pageName: string) => {
  const response = getResponseForPage(placementApplication, 'request-a-placement', pageName)
  return Object.keys(response).map(key => {
    const value =
      typeof response[key] === 'string' || response[key] instanceof String
        ? ({ text: response[key] } as TextItem)
        : ({ html: embeddedSummaryListItem(response[key] as Array<Record<string, unknown>>) } as HtmlItem)

    return summaryListItemForResponse(key, value, 'request-a-placement', pageName, placementApplication, true)
  })
}
