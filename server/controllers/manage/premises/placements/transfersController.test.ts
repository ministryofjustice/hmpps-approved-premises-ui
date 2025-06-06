import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import { Cas1Premises } from '@approved-premises/api'
import TransfersController from './transfersController'
import {
  cas1PremisesBasicSummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../testutils/factories'
import { PlacementService, PremisesService } from '../../../../services'
import managePaths from '../../../../paths/manage'
import * as validationUtils from '../../../../utils/validation'
import { DateFormats } from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'
import { allApprovedPremisesOptions, emergencyTransferSummaryList } from '../../../../utils/placements/transfers'

describe('transfersController', () => {
  const token = 'TEST_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const premisesService = createMock<PremisesService>()
  const transfersController = new TransfersController(placementService, premisesService)

  const premises = cas1PremisesFactory.build()
  const allPremises = cas1PremisesBasicSummaryFactory.buildList(5)
  const destinationAp = allPremises[2]
  const placement = cas1SpaceBookingFactory.current().build()

  const params = { premisesId: premises.id, placementId: placement.id }
  const transfersNewPath = managePaths.premises.placements.transfers.new(params)
  const emergencyDetailsPath = managePaths.premises.placements.transfers.emergencyDetails(params)
  const confirmPath = managePaths.premises.placements.transfers.emergencyConfirm(params)

  const errorsAndUserInput = createMock<ErrorsAndUserInput>()

  const expectRedirectWithErrors = (req: Request, res: Response, errors: Record<string, string>, redirect: string) => {
    expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
      req,
      res,
      new ValidationError({}),
      redirect,
    )
    const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data
    expect(errorData).toEqual(errors)
  }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(DateFormats.isoToDateObj('2025-04-29'))

    placementService.getPlacement.mockResolvedValue(placement)
    premisesService.getCas1All.mockResolvedValue(allPremises)
    premisesService.find.mockResolvedValue(destinationAp as Cas1Premises)
    request = createMock<Request>({
      user: { token },
      params,
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
    })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
    jest.spyOn(transfersController.formData, 'update')
    jest.spyOn(transfersController.formData, 'remove')
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('new', () => {
    it('renders the new transfer form with errors and user input', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/new', {
        backlink: managePaths.premises.placements.show(params),
        pageHeading: 'Request a transfer',
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })

    it('renders the new transfer form with session data if it exists', async () => {
      const sessionData = {
        transferDate: '2025-04-30',
        'transferDate-year': '2025',
        'transferDate-month': '4',
        'transferDate-day': '30',
      }
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: sessionData,
        },
      }
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/transfers/new',
        expect.objectContaining(sessionData),
      )
    })
  })

  describe('saveNew', () => {
    it.each([
      ['empty', '', 'You must enter a transfer date'],
      ['incomplete', '2025-04', 'You must enter a transfer date'],
      ['invalid', '2025-02-37', 'You must enter a valid transfer date'],
      ['more than a week ago', '2025-04-21', 'The date of transfer cannot be earlier than one week ago'],
    ])('shows an error if the transfer date is %s', async (_, date, errorMessage) => {
      const requestHandler = transfersController.saveNew()
      const [year, month, day] = date.split('-')
      request.body = {
        'transferDate-year': year,
        'transferDate-month': month,
        'transferDate-day': day,
      }

      await requestHandler(request, response, next)

      expectRedirectWithErrors(request, response, { transferDate: errorMessage }, transfersNewPath)

      expect(transfersController.formData.update).not.toHaveBeenCalled()
    })

    it('saves the transfer date and redirects to the emergency transfer details page', async () => {
      request.body = {
        'transferDate-year': '2025',
        'transferDate-month': '4',
        'transferDate-day': '27',
      }

      const requestHandler = transfersController.saveNew()

      await requestHandler(request, response, next)

      expect(transfersController.formData.update).toHaveBeenCalledWith(placement.id, request.session, {
        transferDate: '2025-04-27',
        'transferDate-year': '2025',
        'transferDate-month': '4',
        'transferDate-day': '27',
      })
      expect(response.redirect).toHaveBeenCalledWith(emergencyDetailsPath)
    })
  })

  describe('details', () => {
    const sessionData = {
      transferDate: '2025-04-28',
      'transferDate-year': '2025',
      'transferDate-month': '4',
      'transferDate-day': '28',
    }

    beforeEach(() => {
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: { ...sessionData },
        },
      }
    })

    it('redirects to the new transfer page with errors if there is no data in the session', async () => {
      request.session.multiPageFormData = undefined

      const requestHandler = transfersController.details()
      await requestHandler(request, response, next)

      expectRedirectWithErrors(request, response, { session: 'Session expired' }, transfersNewPath)
    })

    it('redirects to the new transfer page with errors if there are errors with the session data', async () => {
      request.session.multiPageFormData.transfers[placement.id]['transferDate-day'] = '42'

      const requestHandler = transfersController.details()
      await requestHandler(request, response, next)

      expectRedirectWithErrors(
        request,
        response,
        { transferDate: 'You must enter a valid transfer date' },
        transfersNewPath,
      )
    })

    it('renders the form with errors and user input', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.details()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/emergency-details', {
        backlink: transfersNewPath,
        pageHeading: 'Enter the emergency transfer details',
        placement,
        approvedPremisesOptions: allApprovedPremisesOptions(allPremises),
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...sessionData,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('saveDetails', () => {
    const sessionData = {
      transferDate: '2025-04-28',
      'transferDate-year': '2025',
      'transferDate-month': '4',
      'transferDate-day': '28',
    }

    beforeEach(() => {
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: { ...sessionData },
        },
      }
    })

    it('shows an error if the destination AP has not been selected', async () => {
      const requestHandler = transfersController.saveDetails()
      request.body = {
        'placementEndDate-year': '2025',
        'placementEndDate-month': '5',
        'placementEndDate-day': '15',
      }

      await requestHandler(request, response, next)

      expectRedirectWithErrors(
        request,
        response,
        {
          destinationPremisesId: 'You must select an Approved Premises for the person to be transferred to',
        },
        emergencyDetailsPath,
      )

      expect(transfersController.formData.update).not.toHaveBeenCalled()
    })

    it.each([
      ['empty', '', 'You must enter a placement end date'],
      ['incomplete', '2025-04', 'You must enter a placement end date'],
      ['invalid', '2025-02-37', 'You must enter a valid placement end date'],
      ['before the transfer date', '2025-04-25', 'The placement end date must be after the transfer date, 28 Apr 2025'],
    ])('shows an error if the placement end date is %s', async (_, date, errorMessage) => {
      const requestHandler = transfersController.saveDetails()
      const [year, month, day] = date.split('-')
      request.body = {
        destinationPremisesId: destinationAp.id,
        'placementEndDate-year': year,
        'placementEndDate-month': month,
        'placementEndDate-day': day,
      }

      await requestHandler(request, response, next)

      expectRedirectWithErrors(request, response, { placementEndDate: errorMessage }, emergencyDetailsPath)
    })

    it('saves the emergency transfer request details and redirects to the confirmation page', async () => {
      request.body = {
        destinationPremisesId: destinationAp.id,
        'placementEndDate-year': '2025',
        'placementEndDate-month': '5',
        'placementEndDate-day': '14',
      }

      const requestHandler = transfersController.saveDetails()

      await requestHandler(request, response, next)

      expect(premisesService.find).toHaveBeenCalledWith(token, destinationAp.id)
      expect(transfersController.formData.update).toHaveBeenCalledWith(placement.id, request.session, {
        destinationPremisesId: destinationAp.id,
        destinationPremisesName: destinationAp.name,
        placementEndDate: '2025-05-14',
        'placementEndDate-year': '2025',
        'placementEndDate-month': '5',
        'placementEndDate-day': '14',
      })
      expect(response.redirect).toHaveBeenCalledWith(confirmPath)
    })
  })

  describe('confirmEmergency', () => {
    const sessionData = {
      transferDate: '2025-04-28',
      'transferDate-year': '2025',
      'transferDate-month': '4',
      'transferDate-day': '28',
      destinationPremisesId: destinationAp.id,
      destinationPremisesName: destinationAp.name,
      placementEndDate: '2025-06-12',
      'placementEndDate-year': '2025',
      'placementEndDate-month': '6',
      'placementEndDate-day': '12',
    }

    beforeEach(() => {
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: { ...sessionData },
        },
      }
    })

    it('redirects to the new transfer page if there is no data in the session', async () => {
      request.session.multiPageFormData = undefined

      const requestHandler = transfersController.confirm()
      await requestHandler(request, response, next)

      expectRedirectWithErrors(request, response, { session: 'Session expired' }, transfersNewPath)
    })

    it('redirects to the new transfer page if there are errors with the session data', async () => {
      request.session.multiPageFormData.transfers[placement.id]['transferDate-day'] = '42'

      const requestHandler = transfersController.confirm()
      await requestHandler(request, response, next)

      expectRedirectWithErrors(
        request,
        response,
        { transferDate: 'You must enter a valid transfer date' },
        transfersNewPath,
      )
    })

    it('redirects to the emergency transfer details page if there are errors with the session data', async () => {
      request.session.multiPageFormData.transfers[placement.id]['placementEndDate-day'] = '42'

      const requestHandler = transfersController.confirm()
      await requestHandler(request, response, next)

      expectRedirectWithErrors(
        request,
        response,
        { placementEndDate: 'You must enter a valid placement end date' },
        emergencyDetailsPath,
      )
    })

    it('renders the confirmation page with a summary of the emergency transfer', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.confirm()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/confirm', {
        backlink: managePaths.premises.placements.transfers.emergencyDetails(params),
        pageHeading: 'Confirm emergency transfer',
        placement,
        summaryList: emergencyTransferSummaryList(sessionData),
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
      })
    })
  })

  describe('createEmergencyTransfer', () => {
    const sessionData = {
      transferDate: '2025-04-28',
      'transferDate-year': '2025',
      'transferDate-month': '4',
      'transferDate-day': '28',
      destinationPremisesId: destinationAp.id,
      destinationPremisesName: destinationAp.name,
      placementEndDate: '2025-06-12',
      'placementEndDate-year': '2025',
      'placementEndDate-month': '6',
      'placementEndDate-day': '12',
    }

    beforeEach(() => {
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: { ...sessionData },
        },
      }
    })

    it('creates the transfer, clears the session and redirects to the placement page', async () => {
      jest.spyOn(placementService, 'createEmergencyTransfer')

      const requestHandler = transfersController.create()

      await requestHandler(request, response, next)

      expect(placementService.createEmergencyTransfer).toHaveBeenCalledWith(
        token,
        params.premisesId,
        params.placementId,
        {
          arrivalDate: sessionData.transferDate,
          departureDate: sessionData.placementEndDate,
          destinationPremisesId: sessionData.destinationPremisesId,
        },
      )
      expect(transfersController.formData.remove).toHaveBeenCalledWith(placement.id, request.session)
      expect(request.flash).toHaveBeenCalledWith('success', {
        heading: 'Emergency transfer recorded',
        body: '<p>You must now record the person as departed, and use the move-on category for transfer.</p>',
      })
      expect(response.redirect).toHaveBeenCalledWith(managePaths.premises.placements.show(params))
    })

    describe('when errors are raised by the API', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const err = new Error()

        placementService.createEmergencyTransfer.mockRejectedValue(err)

        const requestHandler = transfersController.create()
        await requestHandler(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          managePaths.premises.placements.transfers.emergencyConfirm(params),
        )
      })
    })
  })
})
