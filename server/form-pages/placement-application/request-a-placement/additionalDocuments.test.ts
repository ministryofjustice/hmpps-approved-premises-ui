import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { fromPartial } from '@total-typescript/shoehorn'
import { ApplicationService, PersonService } from '../../../services'
import { applicationFactory, documentFactory, placementApplicationFactory } from '../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import AdditionalDocuments from './additionalDocuments'

jest.mock('../../../services/applicationService.ts')

describe('additionalDocuments', () => {
  const placementApplication = placementApplicationFactory.build()
  const application = applicationFactory.build()
  const documents = documentFactory.buildList(3)

  describe('initialize', () => {
    const getDocumentsMock = jest.fn().mockResolvedValue(documents)
    let applicationService: DeepMocked<ApplicationService>
    const personService = createMock<PersonService>({})

    beforeEach(() => {
      applicationService = createMock<ApplicationService>({
        getDocuments: getDocumentsMock,
      })
    })

    it('calls the getDocuments method on the client with a token and the application', async () => {
      await AdditionalDocuments.initialize(
        {},
        placementApplication,
        'some-token',
        fromPartial({
          personService,
          applicationService,
        }),
      )

      expect(getDocumentsMock).toHaveBeenCalledWith('some-token', application)
    })

    it('assigns the selected documents', async () => {
      const page = await AdditionalDocuments.initialize(
        {
          documentIds: [documents[0].id, documents[1].id],
          documentDescriptions: {
            [documents[0].id]: 'Document 1 Description',
            [documents[1].id]: 'Document 2 Description',
          },
        },
        placementApplication,
        'SOME_TOKEN',
        fromPartial({ applicationService, personService }),
      )

      expect(page.body).toEqual({
        selectedDocuments: [
          { ...documents[0], description: 'Document 1 Description' },
          { ...documents[1], description: 'Document 2 Description' },
        ],
      })
      expect(page.documents).toEqual(documents)
    })

    it('assigns the selected documents if the selection is not an array', async () => {
      const page = await AdditionalDocuments.initialize(
        {
          documentIds: documents[0].id,
          documentDescriptions: { [documents[0].id]: documents[0].description as string },
        },
        placementApplication,
        'SOME_TOKEN',
        fromPartial({
          applicationService,
          personService,
        }),
      )

      expect(page.body).toEqual({ selectedDocuments: [documents[0]] })
    })

    it('returns the selected documents if they are already defined', async () => {
      const page = await AdditionalDocuments.initialize(
        {
          selectedDocuments: [documents[0]],
        },
        placementApplication,
        'SOME_TOKEN',
        fromPartial({ applicationService, personService }),
      )

      expect(page.body).toEqual({
        selectedDocuments: [documents[0]],
      })
      expect(page.documents).toEqual(documents)
    })
  })

  itShouldHaveNextValue(new AdditionalDocuments({}, placementApplication), 'updates-to-application')

  itShouldHavePreviousValue(new AdditionalDocuments({}, placementApplication), 'decision-to-release')

  describe('errors', () => {
    it('should return an error if a document does not have a description', () => {
      const selectedDocuments = [
        documentFactory.build({ fileName: 'file1.pdf', description: 'Description goes here' }),
        documentFactory.build({ fileName: 'file2.pdf', description: undefined }),
      ]

      const page = new AdditionalDocuments({ selectedDocuments }, placementApplication)
      expect(page.errors()).toEqual({
        [`selectedDocuments_${selectedDocuments[1].id}`]: `You must enter a description for the document '${selectedDocuments[1].fileName}'`,
      })
    })
    it('should return an error if the user has selected more than 5 documents', () => {
      const selectedDocuments = Array(6)
        .fill(null)
        .map((_, idx) => documentFactory.build({ fileName: `file${idx}.pdf`, description: 'document description' }))
      const page = new AdditionalDocuments({ selectedDocuments }, placementApplication)
      expect(page.errors()).toEqual({
        [`selectedDocuments_${selectedDocuments[5].id}`]: `You can only select 5 documents, remove 1 to continue.`,
      })
    })
  })

  describe('response', () => {
    it('should return a human readable response', () => {
      const selectedDocuments = [
        documentFactory.build({ fileName: 'file1.pdf', description: 'Description goes here' }),
        documentFactory.build({ fileName: 'file2.pdf', description: undefined }),
      ]

      const page = new AdditionalDocuments({ selectedDocuments }, placementApplication)

      expect(page.response()).toEqual({
        'Additional documents': [{ 'file1.pdf': 'Description goes here' }, { 'file2.pdf': 'No description' }],
      })
    })

    it('should return message if no files are attached', () => {
      const page = new AdditionalDocuments({ selectedDocuments: [] }, placementApplication)

      expect(page.response()).toEqual({
        'Additional documents': [{ 'N/A': 'No documents attached' }],
      })
    })
  })
})
