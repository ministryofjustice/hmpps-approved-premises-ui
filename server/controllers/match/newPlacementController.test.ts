import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import NewPlacementController from './newPlacementController'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'

import adminPaths from '../../paths/admin'
import matchPaths from '../../paths/match'
import * as validationUtils from '../../utils/validation'
import { ValidationError } from '../../utils/errors'

describe('newPlacementController', () => {
  const token = 'TEST_TOKEN'
  const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let newPlacementController: NewPlacementController

  beforeEach(() => {
    request = createMock<Request>({
      params: { placementRequestId: placementRequestDetail.id },
      user: { token },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
      flash: jest.fn(),
    })

    newPlacementController = new NewPlacementController()

    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')
  })

  describe('new', () => {
    const defaultRenderParameters = {
      backlink: adminPaths.admin.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
      pageHeading: 'New placement details',
      errors: {},
      errorSummary: [] as Array<string>,
    }

    it('renders the new placement template', async () => {
      await newPlacementController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/new', defaultRenderParameters)
    })
  })

  describe('saveNew', () => {
    it('redirects to the form page with errors if the form is not valid', async () => {
      await newPlacementController.saveNew()({ ...request, body: {} }, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId: placementRequestDetail.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        startDate: 'Enter or select an arrival date',
        endDate: 'Enter or select a departure date',
        reason: 'Enter a reason',
      })
    })
  })
})
