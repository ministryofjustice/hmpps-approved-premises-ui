import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { faker } from '@faker-js/faker'
import { ApType, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { cas1NationalOccupancyFactory, cruManagementAreaFactory, userDetailsFactory } from '../../testutils/factories'
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
  const errorsAndUserInput = createMock<ErrorsAndUserInput>({ errors: {}, errorSummary: [] })

  let nationalOccupancyController: NationalOccupancyController

  const mockRequest = (query: Record<string, string | Array<string>> = {}, session: Record<string, string> = {}) =>
    createMock<Request>({
      user: { token },
      query,
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

      const allApCharacteristics = apCriteria.concat(apTypeToSpaceCharacteristicMap[apType] || [])

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
        processedCapacity: processCapacity(nationalCapacity, postcode),
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
      const queryData = {
        arrivalDate: '16/12/2025',
        apType: Object.keys(apTypeLongLabels)[0],
      }
      const sessionData = {
        apType: Object.keys(apTypeLongLabels)[1],
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
})
