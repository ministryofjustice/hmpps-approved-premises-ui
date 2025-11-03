import { Request, Response, RequestHandler } from 'express'

import { SpaceSearchFormData } from '@approved-premises/ui'
import { newPlacementReasons } from '../../../utils/match'
import adminPaths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { criteriaSummaryList, validateNewPlacement } from '../../../utils/match/newPlacement'
import { PlacementRequestService } from '../../../services'
import { personKeyDetails } from '../../../utils/applications/helpers'
import { ValidationError } from '../../../utils/errors'
import { apTypeRadioItems, checkBoxesForCriteria, initialiseSearchState } from '../../../utils/match/spaceSearch'
import { spaceSearchCriteriaApLevelLabels } from '../../../utils/match/spaceSearchLabels'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'
import MultiPageFormManager from '../../../utils/multiPageFormManager'
import { DateFormats } from '../../../utils/dateUtils'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

export default class NewPlacementController {
  formData: MultiPageFormManager<'spaceSearch'>

  constructor(private readonly placementRequestService: PlacementRequestService) {
    this.formData = new MultiPageFormManager('spaceSearch')
  }

  private async getViewParameters(req: Request) {
    const { placementRequestId } = req.params
    const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
    const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, placementRequestId)
    const contextKeyDetails = personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level)

    return { placementRequestId, placementRequest, contextKeyDetails, errors, errorSummary, userInput }
  }

  private getSearchStateOrRedirect(req: Request, res: Response): SpaceSearchFormData {
    const { placementRequestId } = req.params

    const searchState = this.formData.get(placementRequestId, req.session)

    if (!searchState) {
      res.redirect(matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }))
      return {}
    }

    return searchState
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { placementRequestId, placementRequest, contextKeyDetails, errors, errorSummary, userInput } =
        await this.getViewParameters(req)

      const searchState =
        this.formData.get(placementRequestId, req.session) ||
        (await this.formData.update(placementRequestId, req.session, initialiseSearchState(placementRequest)))

      const formValues = { ...searchState, ...userInput }

      return res.render('match/newPlacement/new', {
        contextKeyDetails,
        backlink: adminPaths.admin.placementRequests.show({ placementRequestId }),
        pageHeading: 'Placement transfer details',
        reasonOptions: convertKeyValuePairToRadioItems(newPlacementReasons),
        errors,
        errorSummary,
        ...formValues,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { placementRequestId },
        body,
      } = req

      try {
        validateNewPlacement(body)

        const [arrivalDate, departureDate] = [body.newPlacementArrivalDate, body.newPlacementDepartureDate].map(
          DateFormats.datepickerInputToIsoString,
        )

        await this.formData.update(placementRequestId, req.session, {
          ...body,
          startDate: arrivalDate,
          durationDays: DateFormats.durationBetweenDates(departureDate, arrivalDate).number,
        })

        res.redirect(matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }),
        )
      }
    }
  }

  checkCriteria(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { placementRequestId, placementRequest, contextKeyDetails, errors, errorSummary, userInput } =
        await this.getViewParameters(req)
      const searchState = this.getSearchStateOrRedirect(req, res)

      return res.render('match/newPlacement/check-criteria', {
        contextKeyDetails,
        backlink: matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }),
        pageHeading: 'Check placement transfer criteria',
        criteriaSummary: criteriaSummaryList(placementRequest),
        criteriaChangedRadioItems: convertKeyValuePairToRadioItems(
          { yes: 'Yes', no: 'No' },
          searchState.newPlacementCriteriaChanged,
        ),
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  saveCheckCriteria(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { placementRequestId },
        body: { criteriaChanged },
      } = req

      try {
        if (!criteriaChanged) {
          throw new ValidationError({ criteriaChanged: 'Select if the criteria have changed' })
        }

        if (criteriaChanged === 'yes') {
          await this.formData.update(placementRequestId, req.session, {
            newPlacementCriteriaChanged: 'yes',
          })

          res.redirect(matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({ placementRequestId }))
          return
        }

        const placementRequest = await this.placementRequestService.getPlacementRequest(
          req.user.token,
          placementRequestId,
        )
        const { apType, apCriteria, roomCriteria } = initialiseSearchState(placementRequest)

        await this.formData.update(placementRequestId, req.session, {
          newPlacementCriteriaChanged: 'no',
          apType,
          apCriteria,
          roomCriteria,
        })

        res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId }),
        )
      }
    }
  }

  updateCriteria(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { placementRequestId, contextKeyDetails, errors, errorSummary, userInput } =
        await this.getViewParameters(req)
      const searchState = this.getSearchStateOrRedirect(req, res)

      return res.render('match/newPlacement/update-criteria', {
        contextKeyDetails,
        backlink: matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId }),
        pageHeading: 'Update placement transfer criteria',
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
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  saveUpdateCriteria(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { placementRequestId },
        body: { apType, apCriteria, roomCriteria },
      } = req

      try {
        if (!apType) {
          throw new ValidationError({ apType: 'Select the type of AP' })
        }

        await this.formData.update(placementRequestId, req.session, {
          apType,
          apCriteria,
          roomCriteria,
        })

        res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({ placementRequestId }),
        )
      }
    }
  }
}
