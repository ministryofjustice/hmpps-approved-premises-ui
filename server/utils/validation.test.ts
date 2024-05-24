import { Request, Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import type { BespokeError, ErrorMessages, ErrorSummary } from '@approved-premises/ui'
import { SanitisedError } from '../sanitisedError'
import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from './validation'
import errorLookups from '../i18n/en/errors.json'
import { TasklistAPIError, ValidationError } from './errors'
import type TaskListPage from '../form-pages/tasklistPage'
import { generateConflictBespokeError } from './bookings'

jest.mock('../i18n/en/errors.json', () => {
  return {
    crn: {
      empty: 'You must enter a CRN',
    },
    arrivalDateTime: {
      empty: 'You must enter a valid arrival date',
      conflict: 'This bedspace is not available for these dates',
    },
    departureDate: {
      conflict: 'This bedspace is not available for these dates',
    },
  }
})
jest.mock('./bookings')

describe('catchValidationErrorOrPropogate', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>()

  const expectedErrors = {
    crn: { text: errorLookups.crn.empty, attributes: { 'data-cy-error-crn': true } },
    arrivalDateTime: {
      text: errorLookups.arrivalDateTime.empty,
      attributes: { 'data-cy-error-arrivalDateTime': true },
    },
  }

  const expectedErrorSummary = [
    { text: errorLookups.crn.empty, href: '#crn' },
    { text: errorLookups.arrivalDateTime.empty, href: '#arrivalDateTime' },
  ]

  beforeEach(() => {
    request.body = {
      some: 'field',
    }
  })

  it('sets the errors and request body as flash messages and redirects back to the form', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.crn',
            errorType: 'empty',
          },
          {
            propertyName: '$.arrivalDateTime',
            errorType: 'empty',
          },
        ],
      },
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('sets a generic error and redirects back to the form', () => {
    const error = createMock<SanitisedError>({
      data: {
        detail: 'Some generic error',
        'invalid-params': [],
      },
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errorSummary', { text: 'Some generic error' })
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('gets errors from a ValidationError type', () => {
    const error = new ValidationError<TaskListPage>({
      data: {
        crn: 'You must enter a valid crn',
        error: 'You must enter a valid arrival date',
      },
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('throws the error if the error is not the type we expect', () => {
    const err = new Error('Some unhandled error')
    err.name = 'SomeUnhandledError'
    err.stack = 'STACK_GOES_HERE'

    const result = () => catchValidationErrorOrPropogate(request, response, err, 'some/url')

    expect(result).toThrowError(err)
    expect(result).toThrowError(
      expect.objectContaining({
        message: 'Some unhandled error',
        name: 'SomeUnhandledError',
        stack: 'STACK_GOES_HERE',
      }),
    )
  })

  it('throws an error if the property is not found in the error lookup', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.foo',
            errorType: 'bar',
          },
        ],
      },
    })

    expect(() => catchValidationErrorOrPropogate(request, response, error, 'some/url')).toThrowError(
      'Cannot find a translation for an error at the path $.foo',
    )
  })

  it('throws an error if the error type is not found in the error lookup', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.crn',
            errorType: 'invalid',
          },
        ],
      },
    })

    expect(() => catchValidationErrorOrPropogate(request, response, error, 'some/url')).toThrowError(
      'Cannot find a translation for an error at the path $.crn with the type invalid',
    )
  })
})

describe('generateConflictErrorAndRedirect', () => {
  it('should add the errors to the flash and redirect', () => {
    const request = createMock<Request>({ headers: { referer: 'foo/bar' } })
    const response = createMock<Response>()
    const premisesId = 'premisesId'
    const err = createMock<SanitisedError>()

    const conflictError = createMock<BespokeError>()
    ;(generateConflictBespokeError as jest.Mock).mockReturnValue(conflictError)

    generateConflictErrorAndRedirect(
      request,
      response,
      premisesId,
      ['arrivalDateTime', 'departureDate'],
      err,
      '/foo/bar',
    )

    const expectedErrors = {
      arrivalDateTime: {
        text: errorLookups.arrivalDateTime.conflict,
        attributes: { 'data-cy-error-arrivalDateTime': true },
      },
      departureDate: {
        text: errorLookups.departureDate.conflict,
        attributes: { 'data-cy-error-departureDate': true },
      },
    }

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorTitle', conflictError.errorTitle)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', conflictError.errorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('/foo/bar')
  })
})

describe('catchAPIErrorOrPropogate', () => {
  const request = createMock<Request>({ headers: { referer: 'foo/bar' } })
  const response = createMock<Response>()

  it('populates the error and redirects to the previous page if the API finds an error', () => {
    const error = new TasklistAPIError('some message', 'field')

    catchAPIErrorOrPropogate(request, response, error)

    expect(request.flash).toHaveBeenCalledWith('errors', {
      crn: { text: error.message, attributes: { 'data-cy-error-field': true } },
    })
    expect(request.flash).toHaveBeenCalledWith('errorSummary', [
      {
        text: error.message,
        href: `#${error.field}`,
      },
    ])

    expect(response.redirect).toHaveBeenCalledWith(request.headers.referer)
  })
})

describe('fetchErrorsAndUserInput', () => {
  const request = createMock<Request>({})

  let errors: ErrorMessages
  let userInput: Record<string, unknown>
  let errorSummary: ErrorSummary
  let errorTitle: string

  beforeEach(() => {
    ;(request.flash as jest.Mock).mockImplementation((message: string) => {
      return {
        errors: [errors],
        userInput: [userInput],
        errorSummary,
        errorTitle: [errorTitle],
      }[message]
    })
  })

  it('returns default values if there is nothing present', () => {
    const result = fetchErrorsAndUserInput(request)

    expect(result).toEqual({ errors: {}, errorSummary: [], userInput: {}, errorTitle: undefined })
  })

  it('fetches the values from the flash', () => {
    errors = createMock<ErrorMessages>()
    errorSummary = createMock<ErrorSummary>()
    userInput = { foo: 'bar' }
    errorTitle = 'Some title'

    const result = fetchErrorsAndUserInput(request)

    expect(result).toEqual({ errors, errorSummary, userInput, errorTitle })
  })
})
