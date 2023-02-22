import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import DocumentsController from './documentsController'
import PersonService from '../../../services/personService'

describe('DocumentsController', () => {
  const token = 'SOME_TOKEN'

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let documentsController: DocumentsController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    documentsController = new DocumentsController(personService)
    request = createMock<Request>({
      user: { token },
      params: { crn: 'some-crn', documentId: 'documentId' },
    })
  })

  describe('show', () => {
    it('should fetch a document', async () => {
      const requestHandler = documentsController.show()

      await requestHandler(request, response, next)

      expect(personService.getDocument).toHaveBeenCalledWith(token, 'some-crn', 'documentId', response)
    })
  })
})
