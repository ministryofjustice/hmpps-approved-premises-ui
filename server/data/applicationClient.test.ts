import ApplicationClient from './applicationClient'
import config from '../config'
import {
  activeOffenceFactory,
  applicationFactory,
  applicationSummaryFactory,
  assessmentFactory,
  documentFactory,
} from '../testutils/factories'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

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
        isPipeApplication: true,
        isWomensApplication: false,
        targetLocation: 'ABC123',
        releaseType: 'licence' as const,
        type: 'CAS1',
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
        uponReceiving: 'A request for all applications',
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

  describe('submit', () => {
    it('should submit the application', async () => {
      const application = applicationFactory.build()
      const data = {
        translatedDocument: application.document,
        isPipeApplication: true,
        isWomensApplication: false,
        targetLocation: 'ABC123',
        releaseType: 'licence' as const,
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

  describe('assessment', () => {
    it('should return an assessment for an application', async () => {
      const applicationId = 'some-uuid'
      const assessment = assessmentFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for all an assessment for an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.assessment({ id: applicationId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: assessment,
        },
      })

      const result = await applicationClient.assessment(applicationId)

      expect(result).toEqual(assessment)
    })
  })
})
