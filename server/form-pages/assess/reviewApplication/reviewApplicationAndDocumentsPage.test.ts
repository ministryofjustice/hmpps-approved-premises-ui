import { createMock } from '@golevelup/ts-jest'
import assessmentFactory from '../../../testutils/factories/assessment'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import Review from './reviewApplicationAndDocumentsPage'
import { ApplicationService } from '../../../services'
import documentFactory from '../../../testutils/factories/document'
import { documentsFromApplication, overwriteApplicationDocuments } from '../../../utils/applicationUtils'
import { Document } from '../../../@types/shared'

describe('Review', () => {
  const assessment = assessmentFactory.build()
  const token = 'my-token'
  describe('title', () => {
    expect(new Review({}, assessment).title).toBe('Review application')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Review({ reviewed: 'yes' }, assessment)
      expect(page.body).toEqual({ reviewed: 'yes' })
    })
  })

  describe('initialize', () => {
    beforeEach(() => {
      assessment.application = overwriteApplicationDocuments(assessment.application, [])
    })

    it('should call the API to fetch documents for the application', async () => {
      const getDocumentsMock = jest.fn().mockResolvedValue(documentFactory.buildList(3))
      const applicationService = createMock<ApplicationService>({ getDocuments: getDocumentsMock })

      await Review.initialize({}, assessment, token, { applicationService })

      expect(applicationService.getDocuments).toHaveBeenCalledWith(token, assessment.application)
    })

    it('should add the full Document objects given the document filenames supplied on the application', async () => {
      const allDocuments = [
        documentFactory.build({ fileName: 'documentA' }),
        documentFactory.build({ fileName: 'documentB' }),
        documentFactory.build({ fileName: 'documentC' }),
      ]
      assessment.application = overwriteApplicationDocuments(assessment.application, [
        { fileName: allDocuments[0].fileName } as Document,
        { fileName: allDocuments[1].fileName } as Document,
      ])

      const getDocumentsMock = jest.fn().mockResolvedValue(allDocuments)

      const applicationService = createMock<ApplicationService>({ getDocuments: getDocumentsMock })

      const page = await Review.initialize({}, assessment, token, { applicationService })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actualDocuments = documentsFromApplication((page as any).document.application)

      expect(actualDocuments).toEqual([allDocuments[0], allDocuments[1]])
    })
  })

  itShouldHaveNextValue(new Review({}, assessment), '')

  itShouldHavePreviousValue(new Review({}, assessment), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new Review({}, assessment)

      expect(page.errors()).toEqual({
        reviewed: 'You must review all of the application and documents provided before proceeding',
      })
    })

    it('should have an error if the answer is "no"', () => {
      const page = new Review({ reviewed: 'no' }, assessment)

      expect(page.errors()).toEqual({
        reviewed: 'You must review all of the application and documents provided before proceeding',
      })
    })
  })

  describe('response', () => {
    it('returns an empty object', () => {
      const page = new Review({ reviewed: 'yes' }, assessment)

      expect(page.response()).toEqual({})
    })
  })
})
