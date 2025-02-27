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
  apAreaFactory,
  bedDetailFactory,
  cas1PremisesFactory,
  outOfServiceBedFactory,
  paginatedResponseFactory,
  premisesSummaryFactory,
} from '../../testutils/factories'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { createQueryString } from '../../utils/utils'
import { ApAreaService, OutOfServiceBedService, PremisesService, SessionService } from '../../services'
import {
  characteristicsBulletList,
  characteristicsPairToCharacteristics,
  roomCharacteristicMap,
} from '../../utils/characteristicsUtils'

jest.mock('../../utils/validation')
jest.mock('../../utils/bookings')
jest.mock('../../utils/getPaginationDetails')

describe('OutOfServiceBedsController', () => {
  const token = 'SOME_TOKEN'
  const backLink = '/back/link'
  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})
  const premisesService = createMock<PremisesService>({})
  const apAreaService = createMock<ApAreaService>({})
  const sessionService = createMock<SessionService>()
  sessionService.getPageBackLink.mockReturnValue('back/link')

  const outOfServiceBedController = new OutOfServiceBedsController(
    outOfServiceBedService,
    premisesService,
    apAreaService,
    sessionService,
  )
  let premisesId = 'premisesId'
  const outOfServiceBed = outOfServiceBedFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
      },
    })
    sessionService.getPageBackLink.mockReturnValue(backLink)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = outOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/new',
        expect.objectContaining({ premisesId, bedId: request.params.bedId }),
      )
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = outOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/new',
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
    it('creates a outOfService bed and redirects to the bed page', async () => {
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
        paths.premises.beds.show({ premisesId: request.params.premisesId, bedId: outOfServiceBed.bed.id }),
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
          paths.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
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
          paths.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
          outOfServiceBed.bed.id,
        )
      })
    })
  })

  describe('show', () => {
    it('shows the outOfService bed', async () => {
      const activeTab = 'details'
      const bed = bedDetailFactory.build({ id: outOfServiceBed.bed.id })
      premisesService.getBed.mockResolvedValue(bed)

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)
      when(outOfServiceBedService.getOutOfServiceBed)
        .calledWith(request.user.token, premisesId, outOfServiceBed.id)
        .mockResolvedValue(outOfServiceBed)

      const requestHandler = outOfServiceBedController.show()
      const req = {
        ...request,
        params: {
          premisesId,
          bedId: outOfServiceBed.bed.id,
          id: outOfServiceBed.id,
          tab: 'details',
        },
      }
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/outOfServiceBeds/show', {
        outOfServiceBed,
        premisesId,
        bedId: bed.id,
        id: outOfServiceBed.id,
        activeTab,
        characteristicsHtml: characteristicsBulletList(characteristicsPairToCharacteristics(bed.characteristics), {
          labels: roomCharacteristicMap,
        }),
        pageHeading: `Out of service bed ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
        backLink,
      })
      expect(sessionService.getPageBackLink).toHaveBeenCalledWith(
        '/manage/premises/:premisesId/beds/:bedId/out-of-service-beds/:id/:tab',
        req,
        [
          '/manage/premises/:premisesId/out-of-service-beds/:temporality',
          '/manage/out-of-service-beds/:temporality',
          '/manage/premises/:premisesId/occupancy/day/:date',
        ],
      )
    })
  })

  describe('premisesIndex', () => {
    it('requests a paginated list of outOfService beds for a premises and renders the template', async () => {
      const temporality = 'current'

      const paginatedResponse = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      const paginationDetails = {
        hrefPrefix: `${paths.outOfServiceBeds.premisesIndex.pattern}?${createQueryString({ temporality, premisesId })}`,
        pageNumber: 1,
      }

      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)

      const premises = cas1PremisesFactory.build({ name: 'Hope House' })
      when(premisesService.find).calledWith(request.user.token, premisesId).mockResolvedValue(premises)

      const req = { ...request, query: { premisesId }, params: { temporality, premisesId } }

      const requestHandler = outOfServiceBedController.premisesIndex()
      await requestHandler(req, response, next)

      expect(premisesService.find).toHaveBeenCalledWith(token, premisesId)

      expect(response.render).toHaveBeenCalledWith('manage/outOfServiceBeds/premisesIndex', {
        outOfServiceBeds: paginatedResponse.data,
        pageHeading: 'Out of service beds',
        premises: { id: premisesId, name: 'Hope House' },
        hrefPrefix: paginationDetails.hrefPrefix,
        temporality,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        totalResults: Number(paginatedResponse.totalResults),
        backLink,
      })

      expect(outOfServiceBedService.getAllOutOfServiceBeds).toHaveBeenCalledWith({
        token,
        page: paginationDetails.pageNumber,
        temporality,
        premisesId,
        perPage: 50,
      })
      expect(sessionService.getPageBackLink).toHaveBeenCalledWith(
        '/manage/premises/:premisesId/out-of-service-beds/:temporality',
        req,
        ['/manage/premises/:premisesId/beds', '/manage/premises/:premisesId'],
      )
    })

    it('redirects to the current temporality if a stray temporal URL parameter is entered', async () => {
      const indexRequest = { ...request, params: { premisesId, temporality: 'abc' } }

      const requestHandler = outOfServiceBedController.premisesIndex()

      await requestHandler(indexRequest, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.outOfServiceBeds.premisesIndex({ temporality: 'current', premisesId }),
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
        hrefPrefix: `${paths.outOfServiceBeds.index.pattern}?${createQueryString({
          temporality,
          apAreaId,
          premisesId,
        })}`,
        pageNumber: 1,
        sortBy: 'roomName',
        sortDirection: 'desc',
      }

      const premises = premisesSummaryFactory.buildList(3)
      const allPremises = premises
      const apAreas = apAreaFactory.buildList(3)

      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)

      const indexRequest = { ...request, query: { premisesId, apAreaId }, params: { temporality } }

      const requestHandler = outOfServiceBedController.index()

      await requestHandler(indexRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/outOfServiceBeds/index', {
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
        disablePremisesSelect: false,
        premises,
        allPremises,
        apAreas,
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
      const apAreaId = 'abc'
      const indexRequest = { ...request, params: { temporality: '123' }, query: { premisesId, apAreaId } }

      const requestHandler = outOfServiceBedController.index()

      await requestHandler(indexRequest, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.outOfServiceBeds.index({ temporality: 'current' }))
    })

    it('if value of Ap Areas and Premises is all empty string is passed to the api for both', async () => {
      const temporality = 'current'
      premisesId = 'all'
      const apAreaId = 'all'
      const paginatedResponse = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      const paginationDetails = {
        hrefPrefix: `${paths.outOfServiceBeds.index.pattern}?${createQueryString({
          temporality,
          premisesId,
        })}`,
        pageNumber: 1,
        sortBy: 'roomName',
        sortDirection: 'desc',
      }

      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)

      const indexRequest = { ...request, params: { temporality }, query: { apAreaId, premisesId } }

      const requestHandler = outOfServiceBedController.index()

      await requestHandler(indexRequest, response, next)

      expect(outOfServiceBedService.getAllOutOfServiceBeds).toHaveBeenCalledWith({
        token,
        page: paginationDetails.pageNumber,
        sortBy: paginationDetails.sortBy,
        sortDirection: paginationDetails.sortDirection,
        temporality,
        apAreaId: '',
        premisesId: '',
      })
    })

    it('calls api with correct parameters and renders filter Premises', async () => {
      const temporality = 'current'

      const apArea1 = apAreaFactory.build({
        id: 'ap-area-1-id',
      })

      const apArea2 = apAreaFactory.build({
        id: 'ap-area-2-id',
      })

      const allApAreas = [apArea1, apArea2]

      const premises1 = cas1PremisesFactory.build({
        apArea: apArea1,
      })

      const premises2 = cas1PremisesFactory.build({
        apArea: apArea1,
      })

      const premises3 = cas1PremisesFactory.build({
        apArea: apArea2,
      })

      const allPremises = [premises1, premises2, premises3]

      const paginatedResponse = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1, {
          apArea: apArea1,
        }),
      }) as PaginatedResponse<OutOfServiceBed>

      apAreaService.getApAreas.mockResolvedValue(allApAreas)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      premisesService.getCas1All.mockResolvedValue(allPremises)

      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue(paginatedResponse)
      ;(getPaginationDetails as jest.Mock).mockReturnValue({})

      const indexRequest = { ...request, params: { temporality }, query: { apAreaId: apArea1.id } }

      const requestHandler = outOfServiceBedController.index()

      await requestHandler(indexRequest, response, next)

      expect(outOfServiceBedService.getAllOutOfServiceBeds).toHaveBeenCalledWith(
        expect.objectContaining({
          apAreaId: apArea1.id,
          premisesId: '',
        }),
      )

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/index',
        expect.objectContaining({
          premises: [premises1, premises2],
          premisesId: '',
          apAreaId: apArea1.id,
          apAreas: allApAreas,
          disablePremisesSelect: false,
          allPremises,
        }),
      )
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
        paths.outOfServiceBeds.premisesIndex({
          premisesId: request.params.premisesId,
          temporality: 'current',
        }),
      )
    })
  })
})
