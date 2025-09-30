import { Request, Response, NextFunction, RequestHandler } from 'express'

import adminPaths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { criteriaSummaryList, validateNewPlacement } from '../../../utils/match/newPlacement'
import { PlacementRequestService } from '../../../services'
import { personKeyDetails } from '../../../utils/placements'
import { ValidationError } from '../../../utils/errors'
import { apTypeRadioItems, checkBoxesForCriteria, initialiseSearchState } from '../../../utils/match/spaceSearch'
import { spaceSearchCriteriaApLevelLabels } from '../../../utils/match/spaceSearchLabels'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'
import MultiPageFormManager from '../../../utils/multiPageFormManager'
import { DateFormats } from '../../../utils/dateUtils'

export default class NewPlacementController {
  formData: MultiPageFormManager<'spaceSearch'>

  constructor(private readonly placementRequestService: PlacementRequestService) {
    this.formData = new MultiPageFormManager('spaceSearch')
  }

  new(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = adminPaths.admin.placementRequests.show({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      const searchState =
        this.formData.get(placementRequestId, req.session) ||
        (await this.formData.update(placementRequestId, req.session, initialiseSearchState(placementRequest)))

      const formValues = {
        arrivalDate: searchState.arrivalDate
          ? DateFormats.isoDateToUIDate(searchState.arrivalDate, { format: 'datePicker' })
          : userInput.arrivalDate,
        departureDate: searchState.departureDate
          ? DateFormats.isoDateToUIDate(searchState.departureDate, { format: 'datePicker' })
          : userInput.departureDate,
        reason: searchState.newPlacementReason || userInput.reason,
      }

      return res.render('match/newPlacement/new', {
        contextKeyDetails: personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level),
        backlink,
        pageHeading: 'New placement details',
        errors,
        errorSummary,
        ...formValues,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { body } = req

      try {
        validateNewPlacement(body)

        const arrivalDate = DateFormats.datepickerInputToIsoString(body.arrivalDate)
        const departureDate = DateFormats.datepickerInputToIsoString(body.departureDate)

        await this.formData.update(placementRequestId, req.session, {
          arrivalDate,
          departureDate,
          startDate: arrivalDate,
          durationDays: DateFormats.durationBetweenDates(departureDate, arrivalDate).number,
          newPlacementReason: body.reason,
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
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      const searchState = this.formData.get(placementRequestId, req.session)

      if (!searchState) {
        return res.redirect(matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }))
      }

      return res.render('match/newPlacement/check-criteria', {
        contextKeyDetails: personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level),
        backlink,
        pageHeading: 'Check the placement criteria',
        criteriaSummary: criteriaSummaryList(placementRequest),
        criteriaChangedRadioItems: [
          {
            value: 'yes',
            text: 'Yes',
            checked: searchState.newPlacementCriteriaChanged === true,
          },
          {
            text: 'No',
            value: 'no',
            checked: searchState.newPlacementCriteriaChanged === false,
          },
        ],
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  saveCheckCriteria(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { body } = req

      try {
        const { criteriaChanged } = body

        if (!criteriaChanged) {
          throw new ValidationError({ criteriaChanged: 'Select if the criteria have changed' })
        }

        if (criteriaChanged === 'yes') {
          await this.formData.update(placementRequestId, req.session, {
            newPlacementCriteriaChanged: true,
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
          newPlacementCriteriaChanged: false,
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
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      const searchState = this.formData.get(placementRequestId, req.session)

      if (!searchState) {
        return res.redirect(matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }))
      }

      return res.render('match/newPlacement/update-criteria', {
        contextKeyDetails: personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level),
        backlink,
        pageHeading: 'Update the placement criteria',
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
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params

      try {
        const { apType, apCriteria, roomCriteria } = req.body

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
