import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput, NationalSpaceSearchFormData } from '@approved-premises/ui'
import { faker } from '@faker-js/faker'
import { ApType, Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { ParsedQs } from 'qs'
import {
  cas1NationalOccupancyFactory,
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cruManagementAreaFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { CruManagementAreaService, PremisesService } from '../../services'
import NationalOccupancyController, { defaultSessionKey } from './nationalOccupancyController'
import { convertKeyValuePairToCheckBoxItems } from '../../utils/formUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/match/spaceSearchLabels'
import { apTypeLongLabels, apTypeToSpaceCharacteristicMap } from '../../utils/apTypeLabels'
import { DateFormats } from '../../utils/dateUtils'
import {
  CRU_AREA_WOMENS,
  getApTypeOptions,
  getCriteriaBlock,
  getDateHeader,
  getManagementAreaSelectGroups,
  getPagination,
  processCapacity,
} from '../../utils/admin/nationalOccupancyUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import * as validationUtils from '../../utils/validation'
import { durationSelectOptions } from '../../utils/match/occupancy'
import { occupancyCalendar } from '../../utils/match/occupancyCalendar'
import { makeArrayOfType } from '../../utils/utils'

describe('NationalOccupancyController', () => {
  const token = 'TEST_TOKEN'
  const user = userDetailsFactory.build()

  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const cruManagementAreaService = createMock<CruManagementAreaService>({})
  const premisesService = createMock<PremisesService>({})

  const cruManagementAreas = [
    ...cruManagementAreaFactory.buildList(5),
    cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS }),
  ]
  const nationalCapacity = cas1NationalOccupancyFactory.build()
  const premisesCapacity = cas1PremiseCapacityFactory.build()

  const premises = cas1PremisesFactory.build()

  const errorsAndUserInput = createMock<ErrorsAndUserInput>({ errors: {}, errorSummary: [] })

  let nationalOccupancyController: NationalOccupancyController

  const mockRequest = (
    query: Request['query'] = {},
    session: NationalSpaceSearchFormData = {},
    params: Request['params'] = {},
  ) =>
    createMock<Request>({
      user: { token },
      query: query as ParsedQs,
      params,
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
        multiPageFormData: { nationalSpaceSearch: { [defaultSessionKey]: session } },
      },
    })

  beforeEach(() => {
    jest.clearAllMocks()
    response = createMock<Response>({ locals: { user } })

    cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)
    premisesService.getMultipleCapacity.mockResolvedValue(nationalCapacity)
    premisesService.find.mockResolvedValue(premises)
    premisesService.getCapacity.mockResolvedValue(premisesCapacity)

    nationalOccupancyController = new NationalOccupancyController(premisesService, cruManagementAreaService)
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
  })

  describe('index', () => {
    it('should render the form with default values', async () => {
      const request = mockRequest({})
      await nationalOccupancyController.index()(request, response, next)

      expect(response.render).toBeCalledWith('admin/nationalOccupancy/index', {
        pageHeading: 'View all Approved Premises spaces',
        backLink: '/admin/cru-dashboard',
        apCriteria: convertKeyValuePairToCheckBoxItems(spaceSearchCriteriaApLevelLabels, []),
        roomCriteria: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, []),
        apTypeOptions: getApTypeOptions(),
        arrivalDate: DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date()), { format: 'datePicker' }),
        cruManagementAreaOptions: getManagementAreaSelectGroups(
          cruManagementAreas,
          undefined,
          cruManagementAreas[0].id,
        ),
        postcode: '',
        errorSummary: errorsAndUserInput.errorSummary,
        errors: errorsAndUserInput.errors,
        criteriaBlock: getCriteriaBlock([], []),
      })

      expect(cruManagementAreaService.getCruManagementAreas).toBeCalled()
    })

    it('should render form with data populated from the query', async () => {
      const arrivalDate = '16/12/2025'
      const apType = faker.helpers.arrayElement(Object.keys(apTypeLongLabels)) as ApType
      const postcode = 'SW1A'
      const roomCriteria = faker.helpers.arrayElements(Object.keys(roomCharacteristicMap), {
        min: 1,
        max: 3,
      }) as Array<Cas1SpaceCharacteristic>
      const apCriteria = faker.helpers.arrayElements(Object.keys(spaceSearchCriteriaApLevelLabels), {
        min: 1,
        max: 3,
      }) as Array<Cas1SpaceCharacteristic>
      const apArea = cruManagementAreas[1].id

      const allApCharacteristics = apCriteria.concat(apTypeToSpaceCharacteristicMap[apType] || [], roomCriteria)

      const request = mockRequest({ arrivalDate, apType, apArea, postcode, roomCriteria, apCriteria })

      await nationalOccupancyController.index()(request, response, next)

      expect(response.render.mock.calls[0][1]).toEqual({
        pageHeading: 'View all Approved Premises spaces',
        backLink: '/admin/cru-dashboard',
        apCriteria: convertKeyValuePairToCheckBoxItems(spaceSearchCriteriaApLevelLabels, apCriteria),
        roomCriteria: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, roomCriteria),
        apTypeOptions: getApTypeOptions(apType),
        arrivalDate,
        cruManagementAreaOptions: getManagementAreaSelectGroups(cruManagementAreas, apArea, cruManagementAreas[0].id),
        postcode,
        criteriaBlock: getCriteriaBlock(apCriteria, roomCriteria),
        dateHeader: getDateHeader(nationalCapacity),
        processedCapacity: processCapacity(nationalCapacity, postcode, roomCriteria),
        fromDate: '2025-12-16',
        pagination: getPagination('2025-12-16'),
        errorSummary: errorsAndUserInput.errorSummary,
        errors: errorsAndUserInput.errors,
      })

      expect(premisesService.getMultipleCapacity).toHaveBeenCalledWith('TEST_TOKEN', {
        cruManagementAreaIds: [apArea],
        fromDate: '2025-12-16',
        postcodeArea: postcode,
        premisesCharacteristics: allApCharacteristics,
        roomCharacteristics: roomCriteria,
      })
    })

    it('should render the form with data merged from the session and query with query dominant', async () => {
      const queryData: { arrivalDate: string; apType: ApType } = {
        arrivalDate: '16/12/2025',
        apType: makeArrayOfType<ApType>(Object.keys(apTypeLongLabels))[0],
      }
      const sessionData: { postcode: string; apType: ApType } = {
        apType: makeArrayOfType<ApType>(Object.keys(apTypeLongLabels))[1],
        postcode: 'SW1A',
      }

      const request = mockRequest(queryData, sessionData)

      await nationalOccupancyController.index()(request, response, next)

      const params = { ...sessionData, ...queryData }

      expect(response.render).toBeCalledWith(
        'admin/nationalOccupancy/index',
        expect.objectContaining({
          arrivalDate: params.arrivalDate,
          postcode: params.postcode,
          apTypeOptions: getApTypeOptions(params.apType),
        }),
      )
      expect(request.session.save).toHaveBeenCalled()
      expect(request.session.multiPageFormData.nationalSpaceSearch[defaultSessionKey]).toEqual(
        expect.objectContaining({ ...sessionData, ...queryData }),
      )
    })

    it('should render errors on invalid input', async () => {
      const arrivalDate = '16/14/2025'
      const postcode = 'SW14AX'

      const request = mockRequest({ arrivalDate, postcode })

      await nationalOccupancyController.index()(request, response, next)

      expect(response.render).toBeCalledWith(
        'admin/nationalOccupancy/index',
        expect.objectContaining({
          postcode,
          arrivalDate,
          errors: {
            arrivalDate: { attributes: { 'data-cy-error-arrivalDate': true }, text: 'Enter a valid arrival date' },
            postcode: { attributes: { 'data-cy-error-postcode': true }, text: 'Enter a valid postcode area' },
          },
          errorSummary: [
            { href: '#arrivalDate', text: 'Enter a valid arrival date' },
            { href: '#postcode', text: 'Enter a valid postcode area' },
          ],
        }),
      )
    })

    it(`should default ap area to women's estate if user is in women's cru area`, async () => {
      const responseWomensUser: DeepMocked<Response> = createMock<Response>({
        locals: { user: { cruManagementArea: { id: CRU_AREA_WOMENS } } },
      })

      const request = mockRequest({})
      await nationalOccupancyController.index()(request, responseWomensUser, next)

      expect(responseWomensUser.render).toBeCalledWith(
        'admin/nationalOccupancy/index',
        expect.objectContaining({
          cruManagementAreaOptions: getManagementAreaSelectGroups(cruManagementAreas, undefined, CRU_AREA_WOMENS),
        }),
      )
    })
  })

  describe('premisesView', () => {
    const arrivalDate = '4/11/2025'
    it('should render the view of one premises', async () => {
      const request = mockRequest({ arrivalDate }, undefined, { premisesId: premises.id })

      await nationalOccupancyController.premisesView()(request, response, next)

      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)

      expect(response.render).toHaveBeenCalledWith('admin/nationalOccupancy/premises', {
        pageHeading: `View spaces in ${premises.name}`,
        arrivalDate,
        backLink: '/admin/national-occupancy?fromDate=2025-11-04',
        premises,
        durationOptions: durationSelectOptions(84),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, []),
        criteriaBlock: getCriteriaBlock(undefined, []),
        calendar: occupancyCalendar(
          premisesCapacity.capacity,
          `/admin/national-occupancy/premises/${premises.id}/date/:date`,
          [],
        ),
        errorSummary: [],
        errors: {},
      })
    })

    it('should read the room criteria and duration from the session', async () => {
      const roomCriteria: Array<Cas1SpaceBookingCharacteristic> = ['isSingle', 'isStepFreeDesignated']
      const request = mockRequest({}, { roomCriteria, durationDays: 7, arrivalDate }, { premisesId: premises.id })
      await nationalOccupancyController.premisesView()(request, response, next)
      expect(response.render.mock.lastCall[1]).toEqual(
        expect.objectContaining({
          durationOptions: durationSelectOptions(7),
          criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, roomCriteria),
          criteriaBlock: getCriteriaBlock(undefined, roomCriteria),
        }),
      )
      expect(request.session.save).not.toHaveBeenCalled()
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
        startDate: '2025-11-04',
        endDate: '2025-11-11',
      })
    })

    it('should write the room criteria and duration into the session if passed in query', async () => {
      const roomCriteria = ['isSingle', 'isStepFreeDesignated']
      const query = { roomCriteria, durationDays: '7', arrivalDate }
      const request = mockRequest(query, {}, { premisesId: premises.id })

      await nationalOccupancyController.premisesView()(request, response, next)

      expect(request.session.save).toHaveBeenCalled()
      expect(request.session.multiPageFormData.nationalSpaceSearch.default).toEqual(query)
    })
  })
})
