import { ApType, WithdrawalReason } from '@approved-premises/api'
import ApplicationClient from './applicationClient'
import config from '../config'
import {
  activeOffenceFactory,
  applicationFactory,
  applicationSummaryFactory,
  cas1TimelineEventFactory,
  documentFactory,
  noteFactory,
  requestForPlacementFactory,
  withdrawableFactory,
} from '../testutils/factories'
import paths from '../paths/api'
import describeClient, { describeCas1NamespaceClient } from '../testutils/describeClient'
import { normaliseCrn } from '../utils/normaliseCrn'
import withdrawablesFactory from '../testutils/factories/withdrawablesFactory'

describeClient('ApplicationClient', provider => {
  let applicationClient: ApplicationClient

  const token = 'token-1'

  beforeEach(() => {
    config.flags.oasysDisabled = false
    applicationClient = new ApplicationClient(token)
  })

  describe('create', () => {
    it('should return an application when a crn is posted', async () => {
      const application = applicationFactory.build()
      const offence = activeOffenceFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create an Application with risks',
        withRequest: {
          method: 'POST',
          path: paths.applications.new.pattern,
          query: {
            createWithRisks: 'true',
          },
          body: {
            crn: application.person.crn,
            convictionId: offence.convictionId,
            deliusEventNumber: offence.deliusEventNumber,
            offenceId: offence.offenceId,
            type: 'CAS1',
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 201,
          body: application,
        },
      })

      const result = await applicationClient.create(application.person.crn, offence)

      expect(result).toEqual(application)
    })

    describe('when oasys integration is disabled', () => {
      beforeEach(() => {
        config.flags.oasysDisabled = true
      })

      it('should request that the risks are skipped', async () => {
        const application = applicationFactory.build()
        const offence = activeOffenceFactory.build()

        provider.addInteraction({
          state: 'Server is healthy',
          uponReceiving: 'A request to create an Application without risks',
          withRequest: {
            method: 'POST',
            path: paths.applications.new.pattern,
            query: {
              createWithRisks: 'false',
            },
            body: {
              crn: application.person.crn,
              convictionId: offence.convictionId,
              deliusEventNumber: offence.deliusEventNumber,
              offenceId: offence.offenceId,
              type: 'CAS1',
            },
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
          willRespondWith: {
            status: 201,
            body: application,
          },
        })

        const result = await applicationClient.create(application.person.crn, offence)

        expect(result).toEqual(application)
      })
    })
  })

  describe('find', () => {
    it('should return an application', async () => {
      const application = applicationFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.show({ id: application.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: application,
        },
      })

      const result = await applicationClient.find(application.id)

      expect(result).toEqual(application)
    })
  })

  describe('update', () => {
    it('should return an application when a PUT request is made', async () => {
      const application = applicationFactory.build()
      const data = {
        data: application.data,
        apType: 'pipe' as ApType,
        isWomensApplication: false,
        targetLocation: 'ABC123',
        releaseType: 'licence' as const,
        type: 'CAS1' as const,
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'Request to update an application',
        withRequest: {
          method: 'PUT',
          path: paths.applications.update({ id: application.id }),
          body: JSON.stringify(data),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: application,
        },
      })

      const result = await applicationClient.update(application.id, data)

      expect(result).toEqual(application)
    })
  })

  describe('all', () => {
    it('should get all previous applications', async () => {
      const previousApplications = applicationSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for all applications for a user',
        withRequest: {
          method: 'GET',
          path: paths.applications.index.pattern,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: previousApplications,
        },
      })

      const result = await applicationClient.all()

      expect(result).toEqual(previousApplications)
    })
  })

  describe('dashboard', () => {
    it('should get all previous applications', async () => {
      const allApplications = applicationSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for all applications',
        withRequest: {
          method: 'GET',
          path: paths.applications.all.pattern,
          query: { page: '1', sortBy: 'arrivalDate', sortDirection: 'asc' },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: allApplications,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await applicationClient.dashboard(1, 'arrivalDate', 'asc', {})

      expect(result).toEqual({
        data: allApplications,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should pass a page number', async () => {
      const allApplications = applicationSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for all applications',
        withRequest: {
          method: 'GET',
          path: paths.applications.all.pattern,
          query: { page: '2', sortBy: 'createdAt', sortDirection: 'desc' },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: allApplications,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await applicationClient.dashboard(2, 'createdAt', 'desc', {})

      expect(result).toEqual({
        data: allApplications,
        pageNumber: '2',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should pass search options', async () => {
      const allApplications = applicationSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for all applications',
        withRequest: {
          method: 'GET',
          path: paths.applications.all.pattern,
          query: {
            page: '2',
            sortBy: 'createdAt',
            sortDirection: 'desc',
            crnOrName: normaliseCrn('foo'),
            status: 'rejected',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: allApplications,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await applicationClient.dashboard(2, 'createdAt', 'desc', {
        crnOrName: 'foo',
        status: 'rejected',
      })

      expect(result).toEqual({
        data: allApplications,
        pageNumber: '2',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })
  })

  describe('submit', () => {
    it('should submit the application', async () => {
      const application = applicationFactory.build()
      const data = {
        translatedDocument: application.document,
        apType: 'pipe' as ApType,
        isWomensApplication: false,
        isEsapApplication: false,
        isEmergencyApplication: false,
        targetLocation: 'ABC123',
        releaseType: 'licence' as const,
        sentenceType: 'life' as const,
        type: 'CAS1',
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to submit an application',
        withRequest: {
          method: 'POST',
          path: paths.applications.submission({ id: application.id }),
          body: data,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await applicationClient.submit(application.id, data)
    })
  })

  describe('documents', () => {
    it('should return documents for an application', async () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for all documents for an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.documents({ id: application.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: documents,
        },
      })

      const result = await applicationClient.documents(application)

      expect(result).toEqual(documents)
    })
  })

  describe('withdrawal', () => {
    it('calls the withdrawal endpoint with the application ID', async () => {
      const applicationId = 'applicationId'
      const newWithdrawal = { reason: 'duplicate_application' as WithdrawalReason, otherReason: 'other reason' }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to withdraw an application',
        withRequest: {
          method: 'POST',
          path: paths.applications.withdrawal({ id: applicationId }),
          body: newWithdrawal,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await applicationClient.withdrawal(applicationId, newWithdrawal)
    })
  })

  describe('requestsForPlacment', () => {
    it('calls the requests for placement endpoint with the application ID', async () => {
      const applicationId = 'applicationId'
      const requestsForPlacement = requestForPlacementFactory.buildList(1)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for the requests for placements of an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.requestsForPlacement({ id: applicationId }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: requestsForPlacement,
        },
      })

      await applicationClient.requestsForPlacement(applicationId)
    })
  })

  describe('addNote', () => {
    it('calls the notes endpoint with the note', async () => {
      const applicationId = 'applicationId'
      const note = noteFactory.build({ id: undefined })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for to add a note to an application',
        withRequest: {
          method: 'POST',
          path: paths.applications.addNote({ id: applicationId }),
          body: note,
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: { ...note, id: 'some-uuid' },
        },
      })

      await applicationClient.addNote(applicationId, note)
    })
  })

  describe('withdrawables', () => {
    it('calls the withdrawables with notes endpoint with the application ID', async () => {
      const applicationId = 'applicationId'
      const withdrawable = withdrawableFactory.buildList(1)
      const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for to add a note to an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.withdrawablesWithNotes({ id: applicationId }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: withdrawables,
        },
      })

      await applicationClient.withdrawablesWithNotes(applicationId)
    })
  })
})

describeCas1NamespaceClient('Cas1ApplicationClient', provider => {
  let applicationClient: ApplicationClient

  const token = 'test-token'

  beforeEach(() => {
    applicationClient = new ApplicationClient(token)
  })

  describe('timeline', () => {
    it('calls the timeline endpoint with the application ID', async () => {
      const applicationId = 'applicationId'
      const timelineEvents = cas1TimelineEventFactory.buildList(1)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for the timeline of an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.timeline({ id: applicationId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: timelineEvents,
        },
      })

      await applicationClient.timeline(applicationId)
    })
  })
})
