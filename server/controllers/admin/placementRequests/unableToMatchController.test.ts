import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PlacementRequestService } from '../../../services'

import paths from '../../../paths/admin'
import UnableToMatchController from './unableToMatchController'

jest.mock('../../../utils/validation')

describe('unableToMatchController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementRequestService = createMock<PlacementRequestService>({})

  let unableToMatchController: UnableToMatchController

  beforeEach(() => {
    unableToMatchController = new UnableToMatchController(placementRequestService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the template', async () => {
      const applicationId = 'some-id'

      request.params.id = applicationId

      const requestHandler = unableToMatchController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/unableToMatch/new', {
        pageHeading: 'Mark as unable to match',
        id: request.params.id,
      })
    })
  })

  describe('create', () => {
    const prId = 'some-id'

    beforeEach(() => {
      request.params.id = prId
    })

    it('calls the service method, redirects to the index screen and shows a confirmation message', async () => {
      request.body.confirm = 'yes'

      const requestHandler = unableToMatchController.create()

      await requestHandler(request, response, next)

      expect(placementRequestService.bookingNotMade).toHaveBeenCalledWith(token, prId, { notes: '' })
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.placementRequests.show({ id: prId }))
      expect(request.flash).toHaveBeenCalledWith('success', 'Application has been marked unable to match')
    })
  })
})
