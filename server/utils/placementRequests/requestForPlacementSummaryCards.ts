import { PageResponse, SummaryListActionItem, SummaryListItem, SummaryListWithCard } from '../../@types/ui'
import {
  ApprovedPremisesApplication as Application,
  Cas1RequestedPlacementPeriod,
  RequestForPlacement,
  User,
} from '../../@types/shared'

import { DateFormats } from '../dateUtils'
import paths from '../../paths/apply'
import { embeddedSummaryListItem } from '../applications/summaryListUtils/embeddedSummaryListItem'
import { RequestForPlacementStatusTag } from './statusTag'
import { sentenceCase } from '../utils'

export class RequestForPlacementSummaryCards {
  private rows: Array<SummaryListItem> = []

  private actionItems: Array<SummaryListActionItem> = []

  private unusedQuestions = ['Dates of placement']

  constructor(
    private readonly requestForPlacement: RequestForPlacement,
    private readonly applicationId: Application['id'],
    private readonly actingUserId: User['id'],
  ) {}

  private questionAndAnswerRows(): void {
    const taskName = 'request-a-placement'
    const pageResponses = this.requestForPlacement?.document?.[taskName]

    pageResponses?.forEach((pageResponse: PageResponse) => {
      const allQuestionsAndAnswers = Object.entries(pageResponse)
      const questionsAndAnswers = allQuestionsAndAnswers.filter(([key]) => !this.unusedQuestions.includes(key))

      questionsAndAnswers.forEach(([question, answer]) => {
        const value =
          typeof answer === 'string'
            ? { text: answer }
            : { html: embeddedSummaryListItem(answer as Array<Record<string, unknown>>) }

        this.rows.push({
          key: {
            text: question,
          },
          value,
        })
      })
    })
  }

  private placementDates(placementPeriod: Cas1RequestedPlacementPeriod): void {
    const items: Record<string, string> = {
      'Expected arrival': DateFormats.isoDateToUIDate(placementPeriod.arrival, { format: 'short' }),
      'Arrival date is flexible': { false: 'No', true: 'Yes' }[String(placementPeriod.arrivalFlexible)] || '',
      Duration: `${placementPeriod.duration} nights`,
    }
    Object.entries(items).forEach(([key, value]) => {
      if (!value) delete items[key]
    })

    this.rows.push({
      key: { text: 'Placement dates' },
      value: {
        html: embeddedSummaryListItem([items]),
      },
    })
  }

  private card(): SummaryListWithCard {
    return {
      card: {
        title: {
          text: `Request made on ${DateFormats.isoDateToUIDate(this.requestForPlacement.submittedAt, { format: 'short' })}`,
          headingLevel: '3',
        },
        attributes: {
          'data-cy-placement-application-id': this.requestForPlacement.id,
        },
        actions: { items: this.actionItems },
      },
      rows: this.rows,
    }
  }

  private statusTag(): void {
    this.rows.push({
      key: { text: 'Status' },
      value: { html: new RequestForPlacementStatusTag(this.requestForPlacement.status).html() },
    })
  }

  private withdrawAction() {
    if (
      this.requestForPlacement.canBeDirectlyWithdrawn &&
      this.requestForPlacement.createdByUserId === this.actingUserId
    ) {
      this.actionItems.push({
        href: paths.applications.withdraw.new({
          id: this.applicationId,
        }),
        text: 'Withdraw',
      })
    }
  }

  private withdrawalReason() {
    this.rows.push({
      key: { text: 'Withdrawal reason' },
      value: { text: sentenceCase(this.requestForPlacement?.withdrawalReason || 'Not supplied') },
    })
  }

  response() {
    this.statusTag()
    if (this.requestForPlacement.status === 'request_withdrawn') {
      this.withdrawalReason()
    }
    if (this.requestForPlacement.requestedPlacementPeriod) {
      this.placementDates(this.requestForPlacement.requestedPlacementPeriod)
    }
    this.questionAndAnswerRows()
    this.withdrawAction()

    return this.card()
  }
}

export const mapRequestsForPlacementToSummaryCards = (
  requestsForPlacement: Array<RequestForPlacement>,
  application: Application,
  actingUser: User,
): Array<SummaryListWithCard> => {
  return requestsForPlacement
    .sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1
    })
    .map(requestForPlacement =>
      new RequestForPlacementSummaryCards(requestForPlacement, application.id, actingUser.id).response(),
    )
}
