import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { ApplicationService } from '../../../services'
import { fetchErrorsAndUserInput } from '../../../utils/validation'

import NotesController from './notesController'
import { applicationShowPageTab } from '../../../utils/applications/utils'

jest.mock('../../../utils/validation')

describe('notesController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})

  let notesController: NotesController

  beforeEach(() => {
    notesController = new NotesController(applicationService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the template', async () => {
      const applicationId = 'some-id'
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = applicationId
      request.body.note = 'Some note'

      const requestHandler = notesController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/notes/new', {
        pageHeading: 'Do you want to add this note?',
        applicationId,
        note: 'Some note',
      })
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'

    beforeEach(() => {
      request.params.id = applicationId
      request.body = {
        note: 'Some note',
      }
    })

    it('calls the service method, redirects to the index screen and shows a confirmation message', async () => {
      const requestHandler = notesController.create()

      await requestHandler(request, response, next)

      expect(applicationService.addNote).toHaveBeenCalledWith(token, applicationId, {
        note: request.body.note,
      })
      expect(response.redirect).toHaveBeenCalledWith(applicationShowPageTab(applicationId, 'timeline'))
      expect(request.flash).toHaveBeenCalledWith('success', 'Note added')
    })
  })
})
