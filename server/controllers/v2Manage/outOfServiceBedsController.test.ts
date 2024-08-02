import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { PaginatedResponse } from '@approved-premises/ui'
import { Cas1OutOfServiceBed as OutOfServiceBed } from '@approved-premises/api'
import { SanitisedError } from '../../sanitisedError'
import OutOfServiceBedsController from './outOfServiceBedsController'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'

import paths from '../../paths/manage'
import {
  bedDetailFactory,
  outOfServiceBedFactory,
  paginatedResponseFactory,
  premisesFactory,
} from '../../testutils/factories'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { createQueryString } from '../../utils/utils'
import { translateCharacteristic } from '../../utils/characteristicsUtils'
import { OutOfServiceBedService, PremisesService } from '../../services'

jest.mock('../../utils/validation')
jest.mock('../../utils/bookings')
jest.mock('../../utils/getPaginationDetails')

describe('OutOfServiceBedsController', () => {
  const token = 'SOME_TOKEN'
  const referrer = 'http://localhost/foo/bar'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})
  const premisesService = createMock<PremisesService>({})

  const outOfServiceBedController = new OutOfServiceBedsController(outOfServiceBedService, premisesService)
  const premisesId = 'premisesId'
  const outOfServiceBed = outOfServiceBedFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      headers: { referer: referrer },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
      },
    })
  })

  describe('new', () => {
    it('renders the form', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = outOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'v2Manage/outOfServiceBeds/new',
        expect.objectContaining({ premisesId, bedId: request.params.bedId }),
      )
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = outOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'v2Manage/outOfServiceBeds/new',
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          errorTitle: errorsAndUserInput.errorTitle,
          ...errorsAndUserInput.userInput,
        }),
      )
    })
  })

  describe('create', () => {
    it('creates a outOfService bed and redirects to the v2 bed page', async () => {
      const requestHandler = outOfServiceBedController.create()

      request.params = {
        ...request.params,
        bedId: outOfServiceBed.bed.id,
      }

      request.body = {
        'startDate-year': 2022,
        'startDate-month': 8,
        'startDate-day': 22,
        'endDate-year': 2022,
        'endDate-month': 9,
        'endDate-day': 22,
        outOfServiceBed,
      }

      await requestHandler(request, response, next)

      expect(outOfServiceBedService.createOutOfServiceBed).toHaveBeenCalledWith(token, premisesId, {
        ...outOfServiceBed,
        startDate: '2022-08-22',
        endDate: '2022-09-22',
        bedId: request.params.bedId,
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'The out of service bed has been recorded')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.v2Manage.premises.beds.show({ premisesId: request.params.premisesId, bedId: outOfServiceBed.bed.id }),
      )
    })

    describe('when errors are raised', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const requestHandler = outOfServiceBedController.create()

        const err = new Error()

        outOfServiceBedService.createOutOfServiceBed.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.v2Manage.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
        )
      })

      it('should call generateConflictErrorAndRedirect if the error is a 409', async () => {
        const requestHandler = outOfServiceBedController.create()
        const err = createMock<SanitisedError>({ status: 409, data: 'some data' })

        outOfServiceBedService.createOutOfServiceBed.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(generateConflictErrorAndRedirect).toHaveBeenCalledWith(
          { ...request },
          { ...response },
          premisesId,
          ['startDate', 'endDate'],
          err,
          paths.v2Manage.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
          outOfServiceBed.bed.id,
        )
      })
    })
  })

  describe('show', () => {
    it('shows the outOfService bed', async () => {
      const activeTab = 'details'
      const bed = bedDetailFactory.build({ id: outOfServiceBed.bed.id })
      const translatedCharacteristics = bed.characteristics.map(characteristic =>
        translateCharacteristic(characteristic),
      )
      premisesService.getBed.mockResolvedValue(bed)

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)
      when(outOfServiceBedService.getOutOfServiceBed)
        .calledWith(request.user.token, premisesId, outOfServiceBed.id)
        .mockResolvedValue(outOfServiceBed)

      const requestHandler = outOfServiceBedController.show()

      await requestHandler(
        {
          ...request,
          params: {
            premisesId,
            bedId: outOfServiceBed.bed.id,
            id: outOfServiceBed.id,
            tab: 'details',
          },
        },
        response,
        next,
      )

      expect(response.render).toHaveBeenCalledWith('v2Manage/outOfServiceBeds/show', {
        outOfServiceBed,
        premisesId,
        bedId: bed.id,
        id: outOfServiceBed.id,
        referrer,
        activeTab,
        characteristics: translatedCharacteristics,
        pageHeading: `Out of service bed ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
      })
    })
  })

  describe('premisesIndex', () => {
    it('requests a paginated list of outOfService beds for a premises and renders the template', async () => {
      const temporality = 'current'

      const paginatedResponse = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      const paginationDetails = {
        hrefPrefix: `${paths.v2Manage.outOfServiceBeds.premisesIndex.pattern}?${createQueryString({ temporality, premisesId })}`,
        pageNumber: 1,
      }

      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)

      const premises = premisesFactory.build({ name: 'Hope House' })
      when(premisesService.find).calledWith(request.user.token, premisesId).mockResolvedValue(premises)

      const req = { ...request, query: { premisesId }, params: { temporality } }

      const requestHandler = outOfServiceBedController.premisesIndex()
      await requestHandler({ ...req, params: { premisesId, temporality } }, response, next)

      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)

      expect(response.render).toHaveBeenCalledWith('v2Manage/outOfServiceBeds/premisesIndex', {
        outOfServiceBeds: paginatedResponse.data,
        pageHeading: 'Out of service beds',
        premises: { id: premisesId, name: 'Hope House' },
        hrefPrefix: paginationDetails.hrefPrefix,
        temporality,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        totalResults: Number(paginatedResponse.totalResults),
      })

      expect(outOfServiceBedService.getAllOutOfServiceBeds).toHaveBeenCalledWith({
        token,
        page: paginationDetails.pageNumber,
        temporality,
        premisesId,
        perPage: 50,
      })
    })

    it('redirects to the current temporality if a stray temporal URL parameter is entered', async () => {
      const indexRequest = { ...request, params: { premisesId, temporality: 'abc' } }

      const requestHandler = outOfServiceBedController.premisesIndex()

      await requestHandler(indexRequest, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.v2Manage.outOfServiceBeds.premisesIndex({ temporality: 'current', premisesId }),
      )
    })
  })

  describe('index', () => {
    it('requests a list of outOfService beds with a page number, sort and filter options, and renders the template', async () => {
      const temporality = 'future'
      const apAreaId = 'abc'

      const paginatedResponse = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      const paginationDetails = {
        hrefPrefix: `${paths.v2Manage.outOfServiceBeds.index.pattern}?${createQueryString({ temporality, apAreaId, premisesId })}`,
        pageNumber: 1,
        sortBy: 'roomName',
        sortDirection: 'desc',
      }

      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)

      const indexRequest = { ...request, query: { premisesId, apAreaId }, params: { temporality } }

      const requestHandler = outOfServiceBedController.index()

      await requestHandler(indexRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('v2Manage/outOfServiceBeds/index', {
        outOfServiceBeds: paginatedResponse.data,
        pageHeading: 'Out of service beds',
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        temporality,
        apAreaId,
        premisesId,
      })
      expect(outOfServiceBedService.getAllOutOfServiceBeds).toHaveBeenCalledWith({
        token,
        page: paginationDetails.pageNumber,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        temporality,
        apAreaId,
        premisesId,
      })
    })

    it('redirects to the current temporality if a stray temporal URL parameter is entered', async () => {
      const indexRequest = { ...request, params: { temporality: '123' } }

      const requestHandler = outOfServiceBedController.index()

      await requestHandler(indexRequest, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.v2Manage.outOfServiceBeds.index({ temporality: 'current' }))
    })
  })

  describe('cancel', () => {
    it('cancels (removes) an outOfService bed and redirects to the outOfService beds index page', async () => {
      outOfServiceBedService.cancelOutOfServiceBed.mockResolvedValue(outOfServiceBed)

      const requestHandler = outOfServiceBedController.cancel()

      request.params = {
        premisesId,
        id: outOfServiceBed.bed.id,
      }

      request.body = { notes: '' }

      await requestHandler(request, response, next)

      expect(outOfServiceBedService.cancelOutOfServiceBed).toHaveBeenCalledWith(
        request.user.token,
        outOfServiceBed.bed.id,
        request.params.premisesId,
        request.body,
      )
      expect(request.flash).toHaveBeenCalledWith('success', 'Out of service bed removed')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.v2Manage.outOfServiceBeds.premisesIndex({
          premisesId: request.params.premisesId,
          temporality: 'current',
        }),
      )
    })
  })
})
