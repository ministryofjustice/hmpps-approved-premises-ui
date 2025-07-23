import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { PremisesService } from '../../../services'
import LocalRestrictionsController from './localRestrictionsController'
import { cas1PremisesFactory } from '../../../testutils/factories'
import managePaths from '../../../paths/manage'
import cas1PremisesLocalRestrictionSummary from '../../../testutils/factories/cas1PremisesLocalRestrictionSummary'

describe('local restrictions controller', () => {
  const token = 'TEST_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const localRestrictionsController = new LocalRestrictionsController(premisesService)

  const premises = cas1PremisesFactory.build({
    localRestrictions: cas1PremisesLocalRestrictionSummary.buildList(3),
  })

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>()

    premisesService.find.mockResolvedValue(premises)
  })

  describe('index', () => {
    it('renders the list of local restrictions for the premises', async () => {
      await localRestrictionsController.index()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/localRestrictions/index', {
        backlink: managePaths.premises.show({ premisesId: premises.id }),
        premises,
        restrictions: premises.localRestrictions,
      })
    })

    it('renders a message if there are no restrictions', async () => {
      const premisesNoRestrictions = cas1PremisesFactory.build({ localRestrictions: [] })
      premisesService.find.mockResolvedValue(premisesNoRestrictions)

      await localRestrictionsController.index()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/localRestrictions/index',
        expect.objectContaining({
          restrictions: [],
        }),
      )
    })
  })

  describe('new', () => {
    it('renders the form to create a local restriction', async () => {
      await localRestrictionsController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/localRestrictions/new', {
        backlink: managePaths.premises.localRestrictions.index({ premisesId: premises.id }),
        premises,
      })
    })
  })
})
