import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import NewPlacementController from './newPlacementController'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'

import adminPaths from '../../paths/admin'

describe('newPlacementController', () => {
  const token = 'TEST_TOKEN'
  const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let newPlacementController: NewPlacementController

  const defaultRenderParameters = {
    backlink: adminPaths.admin.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
    pageHeading: 'New placement',
  }

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
  })

  it('renders the new placement template', async () => {
    await newPlacementController.new()(request, response, next)

    expect(response.render).toHaveBeenCalledWith('match/newPlacement/new', defaultRenderParameters)
  })
})
