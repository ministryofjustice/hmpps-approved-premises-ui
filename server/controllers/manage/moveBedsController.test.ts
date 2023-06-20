import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import BookingService from '../../services/bookingService'
import PremisesService from '../../services/premisesService'
import MoveBedsController from './moveBedsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'
import { bedSummaryFactory, bookingFactory } from '../../testutils/factories'

import { NewBedMove } from '../../@types/shared'

jest.mock('../../utils/validation')

describe('MoveBedsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const premisesService = createMock<PremisesService>({})

  const moveBedsController = new MoveBedsController(bookingService, premisesService)

  const premisesId = 'premisesId'
  const bookingId = 'bookingId'

  describe('new', () => {
    it('renders the form', async () => {
      const requestHandler = moveBedsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const beds = bedSummaryFactory.buildList(1)
      premisesService.getBeds.mockResolvedValue(beds)

      const booking = bookingFactory.build()
      bookingService.find.mockResolvedValue(booking)

      request.params = {
        bookingId,
        premisesId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/beds/move/new', {
        premisesId,
        booking,
        beds,
        pageHeading: 'Move person to a new bed',
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const requestHandler = moveBedsController.new()

      const beds = bedSummaryFactory.buildList(1)
      premisesService.getBeds.mockResolvedValue(beds)

      const booking = bookingFactory.build()
      bookingService.find.mockResolvedValue(booking)

      request.params = {
        bookingId,
        premisesId,
      }

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/beds/move/new', {
        premisesId,
        booking,
        beds,
        pageHeading: 'Move person to a new bed',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })
})
