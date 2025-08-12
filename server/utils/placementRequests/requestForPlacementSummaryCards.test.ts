import {
  RequestForPlacementSummaryCards,
  mapRequestsForPlacementToSummaryCards,
} from './requestForPlacementSummaryCards'
import { applicationFactory, requestForPlacementFactory, userFactory } from '../../testutils/factories'
import paths from '../../paths/apply'
import { DateFormats } from '../dateUtils'
import { RequestForPlacementStatusTag } from './statusTag'
import { sentenceCase } from '../utils'
import { embeddedSummaryListItem } from '../applications/summaryListUtils/embeddedSummaryListItem'

describe('RequestForPlacementSummaryCards', () => {
  const actingUserId = '123'
  const applicationId = '456'

  it('allows document to be nullable', () => {
    const requestForPlacement = requestForPlacementFactory.build({
      document: undefined,
    })

    const actual = new RequestForPlacementSummaryCards(requestForPlacement, applicationId, actingUserId).response()

    expect(actual).toEqual({
      card: {
        actions: {
          items: [],
        },
        attributes: {
          'data-cy-placement-application-id': requestForPlacement.id,
        },
        title: expect.objectContaining({}),
      },
      rows: expect.arrayContaining([
        {
          key: {
            text: 'Status',
          },
          value: {
            html: new RequestForPlacementStatusTag(requestForPlacement.status).html(),
          },
        },
      ]),
    })
  })

  describe('if the RfP cannot be directly withdrawn', () => {
    const requestForPlacement = requestForPlacementFactory.build({
      isWithdrawn: false,
      canBeDirectlyWithdrawn: false,
      withdrawalReason: undefined,
      requestedPlacementPeriod: { duration: 123, arrival: '2024-04-24', arrivalFlexible: true },
    })

    it('should generate a summary card for the request section', () => {
      const summaryCard = new RequestForPlacementSummaryCards(
        requestForPlacement,
        applicationId,
        actingUserId,
      ).response()

      expect(summaryCard).toEqual({
        card: expect.objectContaining({
          title: {
            text: `Request made on ${DateFormats.isoDateToUIDate(requestForPlacement.submittedAt, { format: 'short' })}`,
            headingLevel: '3',
          },
          attributes: {
            'data-cy-placement-application-id': requestForPlacement.id,
          },
        }),
        rows: expect.arrayContaining([
          {
            key: {
              text: 'Status',
            },
            value: {
              html: new RequestForPlacementStatusTag(requestForPlacement.status).html(),
            },
          },
          {
            key: { text: 'Placement dates' },
            value: {
              html: embeddedSummaryListItem([
                {
                  'Expected arrival': '24 Apr 2024',
                  'Arrival date is flexible': 'Yes',
                  Duration: '123 nights',
                },
              ]),
            },
          },
          {
            key: {
              text: 'Why are you requesting a placement?',
            },
            value: {
              text: 'Release directed following parole board or other hearing/decision',
            },
          },
          {
            key: {
              text: 'Enter the date of decision',
            },
            value: {
              text: 'Wed 24 Apr 2024',
            },
          },
          {
            key: {
              text: 'Provide relevant information from the direction to release that will impact the placement',
            },
            value: {
              text: '****** has now been sentenced and is due to be released on the 25/07/2024.',
            },
          },
          {
            key: {
              text: '****.doc',
            },
            value: {
              text: 'result',
            },
          },
          {
            key: {
              text: 'Have there been any significant events since the application was assessed?',
            },
            value: {
              text: 'Yes - ***** was sentenced and is now due to be released on the 25/02/2001',
            },
          },
          {
            key: {
              text: "Has the person's circumstances changed which affect the planned AP placement?",
            },
            value: {
              text: 'No',
            },
          },
          {
            key: {
              text: "Has the person's risk factors changed since the application was assessed?",
            },
            value: {
              text: 'No',
            },
          },
          {
            key: {
              text: "Has the person's access or healthcare needs changed since the application was assessed?",
            },
            value: {
              text: 'No',
            },
          },
          {
            key: {
              text: "Has the person's location factors changed since the application was assessed?",
            },
            value: {
              text: 'No',
            },
          },
        ]),
      })
    })

    it('should not offer an actions', () => {
      const summaryCard = new RequestForPlacementSummaryCards(
        requestForPlacement,
        applicationId,
        actingUserId,
      ).response()

      expect(summaryCard.card.actions.items).toHaveLength(0)
    })
  })

  describe('if the RfP can be withdrawn', () => {
    const requestForPlacement = requestForPlacementFactory.build({
      canBeDirectlyWithdrawn: true,
      createdByUserId: actingUserId,
    })

    it('should generate a summary card for the request section', () => {
      const summaryCard = new RequestForPlacementSummaryCards(
        requestForPlacement,
        applicationId,
        actingUserId,
      ).response()

      expect(summaryCard).toEqual({
        card: expect.objectContaining({
          title: {
            text: `Request made on ${DateFormats.isoDateToUIDate(requestForPlacement.submittedAt, { format: 'short' })}`,
            headingLevel: '3',
          },
          attributes: {
            'data-cy-placement-application-id': requestForPlacement.id,
          },
        }),
        rows: expect.arrayContaining([
          {
            key: {
              text: 'Status',
            },
            value: {
              html: new RequestForPlacementStatusTag(requestForPlacement.status).html(),
            },
          },
          {
            key: {
              text: 'Why are you requesting a placement?',
            },
            value: {
              text: 'Release directed following parole board or other hearing/decision',
            },
          },
          {
            key: {
              text: 'Enter the date of decision',
            },
            value: {
              text: 'Wed 24 Apr 2024',
            },
          },
          {
            key: {
              text: 'Provide relevant information from the direction to release that will impact the placement',
            },
            value: {
              text: '****** has now been sentenced and is due to be released on the 25/07/2024.',
            },
          },
          {
            key: {
              text: '****.doc',
            },
            value: {
              text: 'result',
            },
          },
          {
            key: {
              text: 'Have there been any significant events since the application was assessed?',
            },
            value: {
              text: 'Yes - ***** was sentenced and is now due to be released on the 25/02/2001',
            },
          },
          {
            key: {
              text: "Has the person's circumstances changed which affect the planned AP placement?",
            },
            value: {
              text: 'No',
            },
          },
          {
            key: {
              text: "Has the person's risk factors changed since the application was assessed?",
            },
            value: {
              text: 'No',
            },
          },
          {
            key: {
              text: "Has the person's access or healthcare needs changed since the application was assessed?",
            },
            value: {
              text: 'No',
            },
          },
          {
            key: {
              text: "Has the person's location factors changed since the application was assessed?",
            },
            value: {
              text: 'No',
            },
          },
        ]),
      })
    })

    it('should add a withdraw action item', () => {
      const expectedActionItem = {
        href: paths.applications.withdraw.new({
          id: applicationId,
        }),
        text: 'Withdraw',
      }

      const summaryCard = new RequestForPlacementSummaryCards(
        requestForPlacement,
        applicationId,
        actingUserId,
      ).response()

      expect(summaryCard.card.actions.items).toContainEqual(expectedActionItem)
    })
  })

  describe('if the RfP has a status of request_withdrawn', () => {
    it('adds a row for the withdrawal reason', () => {
      const requestForPlacement = requestForPlacementFactory.build({ status: 'request_withdrawn' })

      const summaryCard = new RequestForPlacementSummaryCards(
        requestForPlacement,
        applicationId,
        actingUserId,
      ).response()

      expect(summaryCard.rows).toContainEqual({
        key: { text: 'Withdrawal reason' },
        value: { text: sentenceCase(requestForPlacement?.withdrawalReason) },
      })
    })
  })
})

describe('mapRequestsForPlacementToSummaryCards', () => {
  it('iterates over a list of RfPs and returns the results as Summary Cards', () => {
    const requestsForPlacement = requestForPlacementFactory.buildList(1)
    const application = applicationFactory.build()
    const user = userFactory.build()
    const result = mapRequestsForPlacementToSummaryCards(requestsForPlacement, application, user)

    expect(result[0]).toEqual(
      new RequestForPlacementSummaryCards(requestsForPlacement[0], application.id, user.id).response(),
    )
  })

  it('sorts by createdAt', () => {
    const earliestRfp = requestForPlacementFactory.build({ createdAt: '2021-01-01T00:00:00.000Z' })
    const latestRfp = requestForPlacementFactory.build({ createdAt: '2022-01-01T00:00:00.000Z' })
    const application = applicationFactory.build()
    const user = userFactory.build()
    const result = mapRequestsForPlacementToSummaryCards([earliestRfp, latestRfp], application, user)

    expect(result[0]).toEqual(new RequestForPlacementSummaryCards(latestRfp, application.id, user.id).response())
    expect(result[1]).toEqual(new RequestForPlacementSummaryCards(earliestRfp, application.id, user.id).response())
  })
})
