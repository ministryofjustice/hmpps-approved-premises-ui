import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput, ErrorSummary, FormPages, SummaryListItem } from '@approved-premises/ui'
import { placementApplicationFactory } from '../../testutils/factories/index'
import ReviewController from './reviewController'
import { PlacementApplicationService } from '../../services'
import PlacementRequest from '../../form-pages/placement-application'
import * as reviewUtils from '../../utils/placementRequests/reviewUtils'

import assessPaths from '../../paths/assess'
import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateErrorMessages,
  generateErrorSummary,
} from '../../utils/validation'
import placementApplicationPaths from '../../paths/placementApplications'
import { PlacementApplicationReview } from '../../utils/placementApplications/review'

jest.mock('../../utils/validation')
jest.mock('../../utils/placementApplications/review')

PlacementRequest.pages = {} as FormPages

describe('reviewController', () => {
  const id = 'some-uuid'
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementApplicationService = createMock<PlacementApplicationService>({})
  const placementApplication = placementApplicationFactory.build()

  let request: DeepMocked<Request> = createMock<Request>({
    headers: { referer: 'some-referrer' },
    params: { id },
    flash: jest.fn(),
  })

  let reviewController: ReviewController

  const reviewQuestions = { card: { title: { text: 'title' } }, rows: [] as Array<SummaryListItem> }

  beforeEach(() => {
    reviewController = new ReviewController(placementApplicationService)
    request = createMock<Request>({
      headers: { referer: 'some-referrer' },
      params: { id },
      flash: jest.fn(),
      user: {
        token: 'token',
      },
    })
    jest.spyOn(reviewUtils, 'placementApplicationQuestionsForReview').mockReturnValue(reviewQuestions)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('show', () => {
    const expectedRenderParameters = {
      pageProps: {
        pageHeading: 'Review information',
        backLink: `${assessPaths.assessments.index({})}?activeTab=requests_for_placement`,
      },
      reviewQuestions,
      placementApplication,
      errors: {},
      errorSummary: [] as Array<ErrorSummary>,
    }
    it('renders the review page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      placementApplicationService.getPlacementApplication.mockResolvedValue(placementApplication)
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return { applicationId: id, step: 'review' }
      })

      await reviewController.show('review')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'placement-applications/pages/review/review',
        expectedRenderParameters,
      )
    })

    it('renders the decision page', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      placementApplicationService.getPlacementApplication.mockResolvedValue(placementApplication)
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return { applicationId: id, step: 'decision' }
      })

      await reviewController.show('decision')(request, response, next)

      expect(response.render).toHaveBeenCalledWith('placement-applications/pages/review/decision', {
        ...expectedRenderParameters,
        pageProps: {
          pageHeading: 'Make a decision',
          backLink: placementApplicationPaths.placementApplications.show({ id }),
        },
      })
    })

    it('shows errors and user input on review page when returning from an error state', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      placementApplicationService.getPlacementApplication.mockResolvedValue(placementApplication)
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return { applicationId: id, step: 'review' }
      })

      await reviewController.show('review')(request, response, next)

      expect(response.render).toHaveBeenCalledWith('placement-applications/pages/review/review', {
        ...expectedRenderParameters,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })

    it('shows errors and user input on decision page when returning from an error state', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      placementApplicationService.getPlacementApplication.mockResolvedValue(placementApplication)
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return { applicationId: id, step: 'decision' }
      })

      await reviewController.show('decision')(request, response, next)

      expect(response.render).toHaveBeenCalledWith('placement-applications/pages/review/decision', {
        ...expectedRenderParameters,
        pageProps: {
          pageHeading: 'Make a decision',
          backLink: placementApplicationPaths.placementApplications.show({ id }),
        },
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('update', () => {
    beforeEach(() => {
      request.session = createMock<Request['session']>({
        placementApplicationDecisions: {},
      })
    })

    it('redirects to the decision path on review update success', async () => {
      const update = jest.fn()
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return { applicationId: id, update }
      })

      const requestHandler = reviewController.update()

      await requestHandler(
        {
          ...request,
          body: {
            summaryOfChanges: 'some changes',
          },
        },
        response,
      )

      expect(update).toHaveBeenCalledTimes(1)
      expect(response.redirect).toHaveBeenCalledWith(
        placementApplicationPaths.placementApplications.review.decision({ id }),
      )
    })

    it('renders errors if the changes summary is empty', async () => {
      const err = new Error('Invalid request body')
      const errors = { summaryOfChanges: 'some error' }

      const update = jest.fn(() => {
        throw err
      })

      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return {
          errors,
          update,
        }
      })
      ;(generateErrorMessages as jest.Mock).mockReturnValue('some error')
      ;(generateErrorSummary as jest.Mock).mockReturnValue('some error summary')

      const requestHandler = reviewController.update()

      await requestHandler(
        {
          ...request,
          body: {
            summaryOfChanges: '',
          },
        },
        response,
      )

      expect(update).toHaveBeenCalledTimes(1)

      expect(generateErrorMessages).toHaveBeenCalledWith(errors)
      expect(generateErrorSummary).toHaveBeenCalledWith(errors)

      expect(request.flash).toHaveBeenCalledWith('errors', 'some error')
      expect(request.flash).toHaveBeenCalledWith('errorSummary', 'some error summary')
      expect(request.flash).toHaveBeenCalledWith('userInput', { summaryOfChanges: '' })
    })

    it('passes unexpected error to catchValidationErrorOrPropogate', async () => {
      const err = new Error()
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return {
          update: jest.fn(() => {
            throw err
          }),
        }
      })

      const requestHandler = reviewController.update()

      await requestHandler(request, response)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, request.headers.referer)
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request = createMock<Request>({
        ...request,
        session: {
          placementApplicationDecisions: { [id]: { summaryOfChanges: 'some changes' } },
        },
      })
    })

    it('redirects to the confirm path on success', async () => {
      const update = jest.fn()
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return {
          applicationId: id,
          update,
        }
      })

      placementApplicationService.submitDecision.mockResolvedValue(placementApplication)

      const requestHandler = reviewController.submit()

      await requestHandler(
        {
          ...request,
          body: {
            decision: 'a decision',
            decisionSummary: 'a decision summary',
          },
        },
        response,
      )

      expect(update).toHaveBeenCalled()
      expect(placementApplicationService.submitDecision).toHaveBeenCalledWith('token', 'some-uuid', {
        summaryOfChanges: 'some changes',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        placementApplicationPaths.placementApplications.review.confirm({ id }),
      )
    })

    it('renders with errors if required fields are missing', async () => {
      const err = new Error('Invalid request body')
      const errors = { decision: 'some error', decisionSummary: 'some other error' }
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return {
          applicationId: id,
          errors,
          update: jest.fn(() => {
            throw err
          }),
        }
      })
      ;(generateErrorMessages as jest.Mock).mockReturnValue('some error')
      ;(generateErrorSummary as jest.Mock).mockReturnValue('some error summary')

      const requestHandler = reviewController.submit()

      await requestHandler(
        {
          ...request,
          body: {
            decision: '',
            decisionSummary: '',
          },
        },
        response,
      )

      expect(generateErrorMessages).toHaveBeenCalledWith(errors)
      expect(generateErrorSummary).toHaveBeenCalledWith(errors)

      expect(request.flash).toHaveBeenCalledWith('errors', 'some error')
      expect(request.flash).toHaveBeenCalledWith('errorSummary', 'some error summary')
      expect(request.flash).toHaveBeenCalledWith('userInput', { decision: '', decisionSummary: '' })
    })

    it('throws an error if submit decision returns an error', async () => {
      ;(PlacementApplicationReview as jest.Mock).mockImplementation(() => {
        return {
          applicationId: id,
          update: jest.fn(),
        }
      })
      const err = { status: 403 }
      placementApplicationService.submitDecision.mockImplementationOnce(() => {
        throw err
      })

      const requestHandler = reviewController.submit()

      await requestHandler(
        {
          ...request,
          body: {
            decision: 'a decision',
            decisionSummary: 'a decision summary',
          },
        },
        response,
      )

      expect(catchAPIErrorOrPropogate).toHaveBeenCalledWith(request, response, err)
    })
  })

  describe('confirm', () => {
    it('renders the confirm page', async () => {
      const requestHandler = reviewController.confirm()

      await requestHandler(request, response)

      expect(response.render).toHaveBeenCalledWith('placement-applications/pages/review/confirm', {
        pageHeading: 'Review complete',
      })
    })
  })
})
