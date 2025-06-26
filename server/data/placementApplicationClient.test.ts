import PlacementApplicationClient from './placementApplicationClient'
import paths from '../paths/api'

import { placementApplicationDecisionEnvelopeFactory, placementApplicationFactory } from '../testutils/factories'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { SubmitPlacementApplication } from '../@types/shared'
import { WithdrawPlacementRequestReason } from '../@types/shared/models/WithdrawPlacementRequestReason'

describeCas1NamespaceClient('placementApplicationClient', provider => {
  let placementApplicationClient: PlacementApplicationClient

  const token = 'token-1'

  beforeEach(() => {
    placementApplicationClient = new PlacementApplicationClient(token)
  })

  describe('find', () => {
    it('makes a get request to the placementApplication endpoint', async () => {
      const placementApplication = placementApplicationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a placement application',
        withRequest: {
          method: 'GET',
          path: paths.placementApplications.show({ id: placementApplication.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementApplication,
        },
      })

      const result = await placementApplicationClient.find(placementApplication.id)

      expect(result).toEqual(placementApplication)
    })
  })
  describe('create', () => {
    it('should return a placement application when a application ID is posted', async () => {
      const applicationId = '123'
      const placementApplication = placementApplicationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a placement application',
        withRequest: {
          method: 'POST',
          path: paths.placementApplications.create({ id: applicationId }),
          body: {
            applicationId,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementApplication,
        },
      })

      const result = await placementApplicationClient.create(applicationId)
      expect(result).toEqual(placementApplication)
    })
  })

  describe('update', () => {
    it('updates and returns a placement application', async () => {
      const placementApplication = placementApplicationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a placement application',
        withRequest: {
          method: 'PUT',
          path: paths.placementApplications.update({ id: placementApplication.id }),
          body: placementApplication,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementApplication,
        },
      })

      const result = await placementApplicationClient.update(placementApplication)

      expect(result).toEqual(placementApplication)
    })
  })

  describe('submission', () => {
    it('submits a placement application', async () => {
      const placementApplications = placementApplicationFactory.buildList(1)
      const placementApplication = placementApplications[0]

      const body: SubmitPlacementApplication = {
        placementDates: [{ expectedArrival: '2021-01-01', duration: 1 }],
        placementType: 'rotl',
        translatedDocument: {},
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to submit a placement application',
        withRequest: {
          method: 'POST',
          path: paths.placementApplications.submit({ id: placementApplication.id }),
          body,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementApplications,
        },
      })

      const result = await placementApplicationClient.submission(placementApplication.id, body)

      expect(result).toEqual(placementApplications)
    })
  })

  describe('decisionSubmission', () => {
    it('submits a placement application decision', async () => {
      const decisionEnvelope = placementApplicationDecisionEnvelopeFactory.build()
      const placementApplication = placementApplicationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to submit a placement application decision',
        withRequest: {
          method: 'POST',
          path: paths.placementApplications.submitDecision({ id: placementApplication.id }),
          body: decisionEnvelope,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementApplication,
        },
      })

      const result = await placementApplicationClient.decisionSubmission(placementApplication.id, decisionEnvelope)

      expect(result).toEqual(placementApplication)
    })
  })

  describe('withdraw', () => {
    it('withdraws a placement application and returns the result', async () => {
      const placementApplication = placementApplicationFactory.build()
      const reason: WithdrawPlacementRequestReason = 'AlternativeProvisionIdentified'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to withdraw a placement application',
        withRequest: {
          method: 'POST',
          path: paths.placementApplications.withdraw({ id: placementApplication.id }),
          body: { reason },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placementApplication,
        },
      })

      const result = await placementApplicationClient.withdraw(placementApplication.id, reason)

      expect(result).toEqual(placementApplication)
    })
  })
})
