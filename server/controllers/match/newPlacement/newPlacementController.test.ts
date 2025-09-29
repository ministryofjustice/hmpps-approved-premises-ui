import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import NewPlacementController from './newPlacementController'
import { cas1PlacementRequestDetailFactory } from '../../../testutils/factories'

import adminPaths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import * as validationUtils from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { criteriaSummaryList } from '../../../utils/match/newPlacement'
import { PlacementRequestService } from '../../../services'
import { personKeyDetails } from '../../../utils/placements'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  filterApLevelCriteria,
  filterRoomLevelCriteria,
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

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const placementRequestService = createMock<PlacementRequestService>({})

  let newPlacementController: NewPlacementController

  beforeEach(() => {
    jest.clearAllMocks()

    request = createMock<Request>({
      params: { placementRequestId: placementRequestDetail.id },
      user: { token },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
      },
      flash: jest.fn(),
    })

    newPlacementController = new NewPlacementController(placementRequestService)

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')
  })

  describe('new', () => {
    const defaultRenderParameters = {
      contextKeyDetails,
      backlink: adminPaths.admin.placementRequests.show({ placementRequestId: placementRequestDetail.id }),
      pageHeading: 'New placement details',
      errors: {},
      errorSummary: [] as Array<string>,
    }

    it('renders the new placement template', async () => {
      await newPlacementController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/new', defaultRenderParameters)
    })
  })

  describe('saveNew', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-09-29'))
    })

    it('redirects to the Check placement criteria page if the form is valid', async () => {
      const validBody = {
        startDate: '3/11/2025',
        endDate: '4/1/2026',
        reason: 'Area now excluded',
      }

      await newPlacementController.saveNew()({ ...request, body: validBody }, response, next)

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
        matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId: placementRequestDetail.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        startDate: 'Enter or select an arrival date',
        endDate: 'Enter or select a departure date',
        reason: 'Enter a reason',
      })
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
        { value: 'yes', text: 'Yes' },
        { value: 'no', text: 'No' },
      ],
      errors: {},
      errorSummary: [] as Array<string>,
    }

    it('renders the check placement criteria template', async () => {
      await newPlacementController.checkCriteria()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/check-criteria', defaultRenderParameters)
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
    })

    it('redirects to the Update placement criteria page if the criteria have changed', async () => {
      await newPlacementController.saveCheckCriteria()({ ...request, body: { criteriaChanged: 'yes' } }, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({
          placementRequestId: placementRequestDetail.id,
        }),
      )
    })

    it('redirects to the Suitability search page if the criteria have not changed', async () => {
      await newPlacementController.saveCheckCriteria()({ ...request, body: { criteriaChanged: 'no' } }, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId: placementRequestDetail.id }),
      )
    })
  })

  describe('updateCriteria', () => {
    const defaultRenderParameters = {
      contextKeyDetails,
      backlink: matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({
        placementRequestId: placementRequestDetail.id,
      }),
      pageHeading: 'Update the placement criteria',
      typeOfApRadioItems: apTypeRadioItems(
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

    it('renders the form to update the new placement criteria', async () => {
      await newPlacementController.updateCriteria()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/newPlacement/update-criteria', defaultRenderParameters)
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
        typeOfAp: 'Select the type of AP',
      })
    })
  })
})
