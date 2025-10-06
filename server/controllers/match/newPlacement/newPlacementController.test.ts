import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SpaceSearchFormData } from '@approved-premises/ui'
import NewPlacementController from './newPlacementController'
import { cas1PlacementRequestDetailFactory, spaceSearchStateFactory } from '../../../testutils/factories'

import adminPaths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import * as validationUtils from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { criteriaSummaryList } from '../../../utils/match/newPlacement'
import { PlacementRequestService } from '../../../services'
import { personKeyDetails } from '../../../utils/applications/helpers'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  filterApLevelCriteria,
  filterRoomLevelCriteria,
  initialiseSearchState,
} from '../../../utils/match/spaceSearch'
import { spaceSearchCriteriaApLevelLabels } from '../../../utils/match/spaceSearchLabels'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'
import { applyApTypeToAssessApType, type ApTypeSpecialist } from '../../../utils/placementCriteriaUtils'

describe('newPlacementController', () => {
  const token = 'TEST_TOKEN'
  const placementRequestDetail = cas1PlacementRequestDetailFactory.build()
  const contextKeyDetails = personKeyDetails(
    placementRequestDetail.person,
    placementRequestDetail.risks.tier.value.level,
  )
  const params = { placementRequestId: placementRequestDetail.id }

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const placementRequestService = createMock<PlacementRequestService>({})

  let newPlacementController: NewPlacementController

  beforeEach(() => {
    jest.clearAllMocks()

    request = createMock<Request>({
      params,
      user: { token },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
      flash: jest.fn(),
    })

    newPlacementController = new NewPlacementController(placementRequestService)

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')
    jest.spyOn(newPlacementController.formData, 'get')
    jest.spyOn(newPlacementController.formData, 'update')
    jest.spyOn(newPlacementController.formData, 'remove')
  })

  describe('new', () => {
    const defaultRenderParameters = {
      contextKeyDetails,
      backlink: adminPaths.admin.placementRequests.show(params),
      pageHeading: 'New placement details',
      errors: {},
      errorSummary: [] as Array<string>,
    }

    it('renders the new placement template with the session search state', async () => {
      const searchState = spaceSearchStateFactory.build({
        newPlacementArrivalDate: '3/11/2025',
        newPlacementDepartureDate: '4/1/2026',
        newPlacementReason: 'Reason for the new placement',
      })
      request.session.multiPageFormData = {
        spaceSearch: { [placementRequestDetail.id]: searchState },
      }

      await newPlacementController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/new', {
        ...defaultRenderParameters,
        ...searchState,
      })
    })

    it('renders the new placement template and initialises the search state', async () => {
      const expectedSearchState: SpaceSearchFormData = initialiseSearchState(placementRequestDetail)

      await newPlacementController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/new', {
        ...defaultRenderParameters,
        ...expectedSearchState,
      })
      expect(newPlacementController.formData.update).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        expectedSearchState,
      )
    })
  })

  describe('saveNew', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-09-29'))
    })

    it('saves the search state and redirects to the Check placement criteria page if the form is valid', async () => {
      const validBody = {
        newPlacementArrivalDate: '3/11/2025',
        newPlacementDepartureDate: '4/1/2026',
        newPlacementReason: 'Area now excluded',
      }

      await newPlacementController.saveNew()({ ...request, body: validBody }, response, next)

      expect(newPlacementController.formData.update).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        newPlacementArrivalDate: '3/11/2025',
        newPlacementDepartureDate: '4/1/2026',
        startDate: '2025-11-03',
        durationDays: 62,
        newPlacementReason: 'Area now excluded',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({
          placementRequestId: placementRequestDetail.id,
        }),
      )
    })

    it('redirects to the form page with errors if the form is not valid', async () => {
      await newPlacementController.saveNew()({ ...request, body: {} }, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        matchPaths.v2Match.placementRequests.newPlacement.new(params),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        newPlacementArrivalDate: 'Enter or select an arrival date',
        newPlacementDepartureDate: 'Enter or select a departure date',
        newPlacementReason: 'Enter a reason',
      })
      expect(newPlacementController.formData.update).not.toHaveBeenCalled()
    })
  })

  describe('checkCriteria', () => {
    const defaultRenderParameters = {
      contextKeyDetails,
      backlink: matchPaths.v2Match.placementRequests.newPlacement.new({
        placementRequestId: placementRequestDetail.id,
      }),
      pageHeading: 'Check the placement criteria',
      criteriaSummary: criteriaSummaryList(placementRequestDetail),
      criteriaChangedRadioItems: [
        { value: 'yes', text: 'Yes', checked: true },
        { value: 'no', text: 'No', checked: false },
      ],
      errors: {},
      errorSummary: [] as Array<string>,
    }

    it('renders the check placement criteria template with the session search state', async () => {
      const searchState = spaceSearchStateFactory.build({
        newPlacementReason: 'Reason for the new placement',
        newPlacementCriteriaChanged: 'yes',
      })
      request.session.multiPageFormData = {
        spaceSearch: { [placementRequestDetail.id]: searchState },
      }

      await newPlacementController.checkCriteria()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/check-criteria', defaultRenderParameters)
    })

    it('redirects to the new placement page if there is no search state', async () => {
      await newPlacementController.checkCriteria()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.newPlacement.new(params))
    })
  })

  describe('saveCheckCriteria', () => {
    it('redirects to the form page with an error if the form is not valid', async () => {
      await newPlacementController.saveCheckCriteria()({ ...request, body: {} }, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({
          placementRequestId: placementRequestDetail.id,
        }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        criteriaChanged: 'Select if the criteria have changed',
      })
      expect(newPlacementController.formData.update).not.toHaveBeenCalled()
    })

    it('saves the search state and redirects to the Update placement criteria page if the criteria have changed', async () => {
      await newPlacementController.saveCheckCriteria()({ ...request, body: { criteriaChanged: 'yes' } }, response, next)

      expect(newPlacementController.formData.update).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        newPlacementCriteriaChanged: 'yes',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({
          placementRequestId: placementRequestDetail.id,
        }),
      )
    })

    it('saves the search state with initial criteria and redirects to the Suitability search page if the criteria have not changed', async () => {
      const { apType, apCriteria, roomCriteria } = initialiseSearchState(placementRequestDetail)

      await newPlacementController.saveCheckCriteria()({ ...request, body: { criteriaChanged: 'no' } }, response, next)

      expect(newPlacementController.formData.update).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        newPlacementCriteriaChanged: 'no',
        apType,
        apCriteria,
        roomCriteria,
      })
      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.search.spaces(params))
    })
  })

  describe('updateCriteria', () => {
    const defaultRenderParameters = {
      contextKeyDetails,
      backlink: matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({
        placementRequestId: placementRequestDetail.id,
      }),
      pageHeading: 'Update placement criteria',
      apTypeRadioItems: apTypeRadioItems(
        applyApTypeToAssessApType[placementRequestDetail.type as ApTypeSpecialist] || 'normal',
      ),
      criteriaCheckboxGroups: [
        checkBoxesForCriteria(
          'AP requirements',
          'apCriteria',
          spaceSearchCriteriaApLevelLabels,
          filterApLevelCriteria(placementRequestDetail.essentialCriteria),
        ),
        checkBoxesForCriteria(
          'Room requirements',
          'roomCriteria',
          roomCharacteristicMap,
          filterRoomLevelCriteria(placementRequestDetail.essentialCriteria),
        ),
      ],
      errors: {},
      errorSummary: [] as Array<string>,
    }

    it('renders the form to update the new placement criteria with the search state data', async () => {
      const searchState = spaceSearchStateFactory.build({
        newPlacementReason: 'Reason for the new placement',
        newPlacementCriteriaChanged: 'yes',
        apType: 'isPIPE',
        apCriteria: ['acceptsNonSexualChildOffenders'],
        roomCriteria: ['isSingle'],
      })
      request.session.multiPageFormData = {
        spaceSearch: { [placementRequestDetail.id]: searchState },
      }

      await newPlacementController.updateCriteria()(request, response, next)

      expect(newPlacementController.formData.get).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(response.render).toHaveBeenCalledWith('match/newPlacement/update-criteria', {
        ...defaultRenderParameters,
        apTypeRadioItems: apTypeRadioItems(searchState.apType),
        criteriaCheckboxGroups: [
          checkBoxesForCriteria(
            'AP requirements',
            'apCriteria',
            spaceSearchCriteriaApLevelLabels,
            searchState.apCriteria,
          ),
          checkBoxesForCriteria('Room requirements', 'roomCriteria', roomCharacteristicMap, searchState.roomCriteria),
        ],
      })
    })

    it('redirects to the new placement page if there is no search state', async () => {
      await newPlacementController.updateCriteria()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.newPlacement.new(params))
    })
  })

  describe('saveUpdateCriteria', () => {
    it('redirects to the form page with an error if the form is not valid', async () => {
      await newPlacementController.saveUpdateCriteria()({ ...request, body: {} }, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({
          placementRequestId: placementRequestDetail.id,
        }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        apType: 'Select the type of AP',
      })
    })

    it('saves the search state and redirects to the suitability search page', async () => {
      const validBody = {
        apType: 'normal',
        apCriteria: ['isArsonDesignated'],
        roomCriteria: ['isSingle'],
      }
      await newPlacementController.saveUpdateCriteria()({ ...request, body: validBody }, response, next)

      expect(newPlacementController.formData.update).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        apType: 'normal',
        apCriteria: ['isArsonDesignated'],
        roomCriteria: ['isSingle'],
      })
      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.search.spaces(params))
    })
  })
})
