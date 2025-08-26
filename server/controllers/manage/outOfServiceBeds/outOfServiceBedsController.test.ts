import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { PaginatedResponse } from '@approved-premises/ui'
import { Cas1OutOfServiceBed as OutOfServiceBed, Cas1OutOfServiceBedReason } from '@approved-premises/api'
import { SanitisedError } from '../../../sanitisedError'
import OutOfServiceBedsController from './outOfServiceBedsController'
import * as validationUtils from '../../../utils/validation'
import * as outOfServiceBedUtils from '../../../utils/outOfServiceBedUtils'
import outOfServiceBedReasonsJson from '../../../testutils/referenceData/stubs/cas1/out-of-service-bed-reasons.json'

import paths from '../../../paths/manage'
import {
  apAreaFactory,
  cas1BedDetailFactory,
  cas1PremisesFactory,
  outOfServiceBedFactory,
  paginatedResponseFactory,
  premisesFactory,
  userDetailsFactory,
} from '../../../testutils/factories'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { createQueryString } from '../../../utils/utils'
import { ApAreaService, OutOfServiceBedService, PremisesService, SessionService } from '../../../services'
import { characteristicsBulletList, roomCharacteristicMap } from '../../../utils/characteristicsUtils'
import {
  CreateOutOfServiceBedBody,
  outOfServiceBedActions,
  outOfServiceBedSummaryList,
  outOfServiceBedTableHeaders,
  outOfServiceBedTableRows,
  outOfServiceBedTabs,
  premisesIndexTabs,
} from '../../../utils/outOfServiceBedUtils'
import { ValidationError } from '../../../utils/errors'
import { summaryListItem } from '../../../utils/formUtils'

jest.mock('../../../utils/getPaginationDetails')

describe('OutOfServiceBedsController', () => {
  const token = 'SOME_TOKEN'
  const backLink = '/back/link'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const errorsAndUserInput = createMock<ErrorsAndUserInput>()

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
    jest.restoreAllMocks()
    request = createMock<Request>({
      user: { token },
      session: {
        user: userDetailsFactory.build(),
      },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
      },
    })

    sessionService.getPageBackLink.mockReturnValue(backLink)
    outOfServiceBedService.getOutOfServiceBedReasons.mockResolvedValue(
      outOfServiceBedReasonsJson as Array<Cas1OutOfServiceBedReason>,
    )
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('renders the form with reasons, errors and user input', async () => {
      await outOfServiceBedController.new()(request, response, next)

      expect(outOfServiceBedService.getOutOfServiceBedReasons).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('manage/outOfServiceBeds/new', {
        backlink: paths.premises.beds.show({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
        pageHeading: 'Mark a bed as out of service',
        premisesId,
        bedId: request.params.bedId,
        outOfServiceBedReasons: outOfServiceBedReasonsJson,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    const validBody: CreateOutOfServiceBedBody = {
      'startDate-year': '2022',
      'startDate-month': '8',
      'startDate-day': '22',
      'endDate-year': '2022',
      'endDate-month': '9',
      'endDate-day': '22',
      reason: outOfServiceBedReasonsJson.find(reason => reason.referenceType === 'workOrder').id,
      referenceNumber: '',
      notes: 'Some notes',
    }

    it('creates a outOfService bed and redirects to the bed page', async () => {
      request.body = { ...validBody }

      await outOfServiceBedController.create()(request, response, next)

      expect(outOfServiceBedService.createOutOfServiceBed).toHaveBeenCalledWith(token, premisesId, {
        startDate: '2022-08-22',
        endDate: '2022-09-22',
        bedId: request.params.bedId,
        reason: request.body.reason,
        referenceNumber: request.body.referenceNumber,
        notes: request.body.notes,
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'The out of service bed has been recorded')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.beds.show({ premisesId: request.params.premisesId, bedId: outOfServiceBed.bed.id }),
      )
    })

    it('should handle validation errors and redirect to the form', async () => {
      jest.spyOn(outOfServiceBedUtils, 'validateOutOfServiceBedInput').mockImplementation(() => {
        throw new ValidationError({
          startDate: 'You must enter a start date',
        })
      })

      await outOfServiceBedController.create()(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data
      expect(errorData).toEqual({
        startDate: 'You must enter a start date',
      })
    })

    describe('when errors are raised by the API', () => {
      beforeEach(() => {
        request.body = { ...validBody }
      })

      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const err = new Error('API error: cannot create OOSB')

        outOfServiceBedService.createOutOfServiceBed.mockRejectedValue(err)

        await outOfServiceBedController.create()(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
        )
      })

      it('should call generateConflictErrorAndRedirect if the error is a 409', async () => {
        jest.spyOn(validationUtils, 'generateConflictErrorAndRedirect')

        const err = createMock<SanitisedError>({
          status: 409,
          data: {
            detail:
              'An out-of-service bed already exists for dates from 2024-10-01 to 2024-10-14 which overlaps with the desired dates: 220a71da-bf5c-424d-94ff-254ecac5b857',
          },
        })
        outOfServiceBedService.createOutOfServiceBed.mockRejectedValue(err)

        await outOfServiceBedController.create()(request, response, next)

        expect(validationUtils.generateConflictErrorAndRedirect).toHaveBeenCalledWith(
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
      const bed = cas1BedDetailFactory.build({ id: outOfServiceBed.bed.id })
      premisesService.getBed.mockResolvedValue(bed)

      when(outOfServiceBedService.getOutOfServiceBed)
        .calledWith(request.user.token, premisesId, outOfServiceBed.id)
        .mockResolvedValue(outOfServiceBed)

      const req = {
        ...request,
        params: {
          premisesId,
          bedId: outOfServiceBed.bed.id,
          id: outOfServiceBed.id,
          tab: 'details',
        },
      }
      await outOfServiceBedController.show()(req, response, next)

      const summaryList = outOfServiceBedSummaryList(outOfServiceBed)
      summaryList.rows = [
        ...summaryList.rows,
        summaryListItem(
          'Characteristics',
          characteristicsBulletList(bed.characteristics, {
            labels: roomCharacteristicMap,
          }),
          'html',
        ),
      ]

      expect(response.render).toHaveBeenCalledWith('manage/outOfServiceBeds/show', {
        summaryList,
        outOfServiceBed,
        premisesId,
        bedId: bed.id,
        id: outOfServiceBed.id,
        activeTab,
        pageHeading: `Out of service bed ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
        backLink,
        actions: outOfServiceBedActions(request.session.user, premisesId, bed.id, outOfServiceBed.id),
        tabs: outOfServiceBedTabs(premisesId, bed.id, outOfServiceBed.id, activeTab),
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
        pageHeading: 'Out of service beds',
        tabs: premisesIndexTabs(premisesId, temporality),
        premises: { id: premisesId, name: 'Hope House' },
        hrefPrefix: paginationDetails.hrefPrefix,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        totalResults: Number(paginatedResponse.totalResults),
        tableHeaders: outOfServiceBedTableHeaders(),
        tableRows: outOfServiceBedTableRows(paginatedResponse.data, premisesId),
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

      const premises = premisesFactory.buildList(3)
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
})
