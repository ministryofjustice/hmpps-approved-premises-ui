import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { PremisesService } from '../../../services'
import LocalRestrictionsController from './localRestrictionsController'
import { cas1PremisesFactory } from '../../../testutils/factories'
import managePaths from '../../../paths/manage'

describe('local restrictions controller', () => {
  const token = 'TEST_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const localRestrictionsController = new LocalRestrictionsController(premisesService)

  const premises = cas1PremisesFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>()

    premisesService.find.mockResolvedValue(premises)
  })

  it("renders the list of the premises's local restrictions", async () => {
    await localRestrictionsController.index()(request, response, next)

    expect(response.render).toHaveBeenCalledWith('manage/premises/localRestrictions/index', {
      backlink: managePaths.premises.show({ premisesId: premises.id }),
      premises,
    })
  })
})
