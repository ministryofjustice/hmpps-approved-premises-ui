import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { faker } from '@faker-js/faker'
import { PremisesService } from '../../../services'
import LocalRestrictionsController from './localRestrictionsController'
import { cas1PremisesFactory, cas1PremisesNewLocalRestrictionFactory } from '../../../testutils/factories'
import managePaths from '../../../paths/manage'
import cas1PremisesLocalRestrictionSummary from '../../../testutils/factories/cas1PremisesLocalRestrictionSummary'
import * as validationUtils from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { localRestrictionsTableRows } from '../../../utils/premises'
import { characteristicsBulletList } from '../../../utils/characteristicsUtils'
import { spaceSearchResultsCharacteristicsLabels } from '../../../utils/match/spaceSearchLabels'

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
    request = createMock<Request>({ user: { token }, params: { premisesId: premises.id }, flash: jest.fn() })
    response = createMock<Response>()

    premisesService.find.mockResolvedValue(premises)
  })

  describe('index', () => {
    it('renders the list of local restrictions for the premises', async () => {
      await localRestrictionsController.index()(request, response, next)

      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(response.render).toHaveBeenCalledWith('manage/premises/localRestrictions/index', {
        backlink: managePaths.premises.show({ premisesId: premises.id }),
        premises,
        characteristics: characteristicsBulletList(premises.characteristics, {
          labels: spaceSearchResultsCharacteristicsLabels,
        }),
        restrictionsRows: localRestrictionsTableRows(premises),
      })
    })

    it('renders a message if there are no restrictions', async () => {
      const premisesNoRestrictions = cas1PremisesFactory.build({ localRestrictions: [] })
      premisesService.find.mockResolvedValue(premisesNoRestrictions)

      await localRestrictionsController.index()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/localRestrictions/index',
        expect.objectContaining({
          restrictionsRows: [],
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
        errors: {},
        errorSummary: [],
      })
    })

    it('renders errors and user input', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)

      await localRestrictionsController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/localRestrictions/new', {
        backlink: managePaths.premises.localRestrictions.index({ premisesId: premises.id }),
        premises,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    beforeEach(() => {
      jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')
    })

    it.each([
      ['empty', '', 'Enter details for the restriction'],
      ['over 100 characters', faker.word.words(30), 'The restriction must be 100 characters or less'],
    ])('returns an error if the description is %s', async (_, description, errorMessage) => {
      request.body.description = description

      await localRestrictionsController.create()(request, response, next)

      const expectedErrorData = {
        description: errorMessage,
      }

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        managePaths.premises.localRestrictions.new({ premisesId: premises.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    it('should handle API errors', async () => {
      request.body.description = 'Valid restriction description'

      const err = new Error('Error creating local restriction')
      premisesService.createLocalRestriction.mockRejectedValue(err)

      await localRestrictionsController.create()(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        managePaths.premises.localRestrictions.new({ premisesId: premises.id }),
      )
    })

    it('creates the restriction', async () => {
      const newLocalRestriction = cas1PremisesNewLocalRestrictionFactory.build()
      request.body.description = newLocalRestriction.description

      await localRestrictionsController.create()(request, response, next)

      expect(premisesService.createLocalRestriction).toHaveBeenCalledWith(token, premises.id, newLocalRestriction)
      expect(validationUtils.catchValidationErrorOrPropogate).not.toHaveBeenCalled()
      expect(request.flash).toHaveBeenCalledWith('success', 'The restriction has been added.')
      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.localRestrictions.index({ premisesId: premises.id }),
      )
    })
  })

  describe('confirmRemove', () => {
    it('shows the restriction to be removed and any API errors', async () => {
      const errorsAndUserInput: ErrorsAndUserInput = {
        errorTitle: 'Some error title',
        errors: {},
        errorSummary: [{ text: 'Some error message' }],
        userInput: {
          restrictionId: premises.localRestrictions[1].id,
        },
      }
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)

      request.params.restrictionId = premises.localRestrictions[1].id

      await localRestrictionsController.confirmRemove()(request, response, next)

      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(response.render).toHaveBeenCalledWith('manage/premises/localRestrictions/confirmRemove', {
        backlink: managePaths.premises.localRestrictions.index({ premisesId: premises.id }),
        premises,
        restriction: premises.localRestrictions[1],
        errorSummary: errorsAndUserInput.errorSummary,
      })
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      request.params.restrictionId = 'some-id'
    })

    it('should handle API errors', async () => {
      const err = new Error('Error deleting local restriction')

      premisesService.deleteLocalRestriction.mockRejectedValue(err)

      await localRestrictionsController.remove()(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        managePaths.premises.localRestrictions.remove({ premisesId: premises.id, restrictionId: 'some-id' }),
      )
    })

    it('should delete the restriction and redirect with a success message', async () => {
      await localRestrictionsController.remove()(request, response, next)

      expect(premisesService.deleteLocalRestriction).toHaveBeenCalledWith(token, premises.id, 'some-id')
      expect(request.flash).toHaveBeenCalledWith('success', 'The restriction has been removed.')
      expect(response.redirect).toHaveBeenCalledWith(
        managePaths.premises.localRestrictions.index({ premisesId: premises.id }),
      )
    })
  })
})
