import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import { faker } from '@faker-js/faker'
import { cruManagementAreaFactory, userDetailsFactory } from '../../testutils/factories'
import { CruManagementAreaService } from '../../services'
import NationalOccupancyController from './nationalOccupancyController'
import { convertKeyValuePairToCheckBoxItems } from '../../utils/formUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../utils/match/spaceSearchLabels'
import { apTypeLongLabels } from '../../utils/apTypeLabels'
import { DateFormats } from '../../utils/dateUtils'
import { CRU_AREA_WOMENS, getManagementAreaSelectGroups } from '../../utils/admin/nationalOccupancyUtils'
import { roomCharacteristicMap } from '../../utils/characteristicsUtils'
import * as validationUtils from '../../utils/validation'

describe('NationalOccupancyController', () => {
  const token = 'TEST_TOKEN'
  const user = userDetailsFactory.build()

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const cruManagementAreaService = createMock<CruManagementAreaService>({})

  const cruManagementAreas = [
    ...cruManagementAreaFactory.buildList(5),
    cruManagementAreaFactory.build({ id: CRU_AREA_WOMENS }),
  ]
  const errorsAndUserInput = createMock<ErrorsAndUserInput>({ errors: {}, errorSummary: [] })

  let nationalOccupancyController: NationalOccupancyController

  beforeEach(() => {
    jest.clearAllMocks()
    request = createMock<Request>({ user: { token }, query: {} })
    response = createMock<Response>({ locals: { user } })

    cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)

    nationalOccupancyController = new NationalOccupancyController(cruManagementAreaService)
    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')

    when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)
  })

  describe('index', () => {
    it('should render the form with default values', async () => {
      await nationalOccupancyController.index()(request, response, next)

      expect(response.render).toBeCalledWith('admin/nationalOccupancy/index', {
        pageHeading: 'View all Approved Premises spaces',
        backLink: '/admin/cru-dashboard',
        apCharacteristics: convertKeyValuePairToCheckBoxItems(spaceSearchCriteriaApLevelLabels, []),
        roomCharacteristics: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, []),
        apType: undefined,
        apTypes: Object.entries(apTypeLongLabels).map(([id, name]) => ({ id, name })),
        arrivalDate: DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date()), { format: 'datePicker' }),
        cruManagementAreaOptions: getManagementAreaSelectGroups(
          cruManagementAreas,
          undefined,
          cruManagementAreas[0].id,
        ),
        postcodeArea: '',
        errorSummary: errorsAndUserInput.errorSummary,
        errors: errorsAndUserInput.errors,
      })

      expect(cruManagementAreaService.getCruManagementAreas).toBeCalled()
    })

    it('should render the populated form', async () => {
      const arrivalDate = '16/12/2025'
      const apType = faker.helpers.arrayElement(Object.keys(apTypeLongLabels))
      const postcodeArea = 'SW14A'
      const roomCharacteristics = faker.helpers.arrayElements(Object.keys(roomCharacteristicMap), { min: 1, max: 3 })
      const apCharacteristics = faker.helpers.arrayElements(Object.keys(spaceSearchCriteriaApLevelLabels), {
        min: 1,
        max: 3,
      })
      const apArea = cruManagementAreas[1].id

      const parameterRequest = createMock<Request>({
        user: { token },
        query: { arrivalDate, apType, apArea, postcodeArea, roomCharacteristics, apCharacteristics },
      })

      await nationalOccupancyController.index()(parameterRequest, response, next)

      expect(response.render).toBeCalledWith(
        'admin/nationalOccupancy/index',
        expect.objectContaining({
          apCharacteristics: convertKeyValuePairToCheckBoxItems(spaceSearchCriteriaApLevelLabels, apCharacteristics),
          roomCharacteristics: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, roomCharacteristics),
          apType,
          arrivalDate,
          cruManagementAreaOptions: getManagementAreaSelectGroups(cruManagementAreas, apArea, cruManagementAreas[0].id),
          postcodeArea,
        }),
      )
    })

    it('should render errors on invalid input', async () => {
      const arrivalDate = '16/14/2025'
      const postcodeArea = 'SW14AX'

      const errorRequest = createMock<Request>({
        user: { token },
        query: { arrivalDate, postcodeArea },
      })

      await nationalOccupancyController.index()(errorRequest, response, next)

      expect(response.render).toBeCalledWith(
        'admin/nationalOccupancy/index',
        expect.objectContaining({
          postcodeArea,
          arrivalDate,
          errors: {
            arrivalDate: { attributes: { 'data-cy-error-arrivalDate': true }, text: 'Invalid arrival date' },
            postcodeArea: { attributes: { 'data-cy-error-postcodeArea': true }, text: 'Invalid postcode area' },
          },
          errorSummary: [
            { href: '#arrivalDate', text: 'Invalid arrival date' },
            { href: '#postcodeArea', text: 'Invalid postcode area' },
          ],
        }),
      )
    })

    it(`should default ap area to women's estate if user is in women's cru area`, async () => {
      const responseWomensUser: DeepMocked<Response> = createMock<Response>({
        locals: { user: { cruManagementArea: { id: CRU_AREA_WOMENS } } },
      })

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
