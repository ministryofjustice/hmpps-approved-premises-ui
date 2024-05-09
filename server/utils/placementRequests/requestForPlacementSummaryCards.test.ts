import {
  RequestForPlacementSummaryCards,
  mapRequestsForPlacementToSummaryCards,
} from './requestForPlacementSummaryCards'
import { applicationFactory, requestForPlacementFactory, userFactory } from '../../testutils/factories'
import paths from '../../paths/apply'
import { DateFormats } from '../dateUtils'
import { RequestForPlacementStatusTag } from './statusTag'

describe('RequestForPlacementSummaryCards', () => {
  const actingUserId = '123'
  const applicationId = '456'

  describe('if the RfP cannot be directly withdrawn', () => {
    const requestForPlacement = requestForPlacementFactory.build({
      isWithdrawn: false,
      canBeDirectlyWithdrawn: false,
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
            text: `Request made on ${DateFormats.isoDateToUIDate(requestForPlacement.createdAt, { format: 'short' })}`,
            headingLevel: '3',
          },
          attributes: {
            'data-cy-placement-application-id': requestForPlacement.id,
          },
        }),
        rows: [
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
        ],
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
            text: `Request made on ${DateFormats.isoDateToUIDate(requestForPlacement.createdAt, { format: 'short' })}`,
            headingLevel: '3',
          },
          attributes: {
            'data-cy-placement-application-id': requestForPlacement.id,
          },
        }),
        rows: [
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
        ],
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
