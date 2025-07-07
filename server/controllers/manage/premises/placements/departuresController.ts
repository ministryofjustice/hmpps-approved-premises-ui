import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NewDeparture, Cas1SpaceBooking } from '@approved-premises/api'
import { DepartureFormData, ErrorsAndUserInput, ObjectWithDateParts } from '@approved-premises/ui'
import { addDays, isBefore, isPast, isToday } from 'date-fns'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import {
  DateFormats,
  dateAndTimeInputsAreValidDates,
  isoDateAndTimeToDateObj,
  timeIsValid24hrFormat,
  dateIsPast,
  timeAddLeadingZero,
} from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'
import paths from '../../../../paths/manage'
import {
  BED_WITHDRAWN_REASON_ID,
  BREACH_OR_RECALL_REASON_ID,
  LICENCE_EXPIRED_REASON_ID,
  MOVE_TO_AP_REASON_ID,
  PLANNED_MOVE_ON_REASON_ID,
} from '../../../../utils/placements'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'

const {
  premises: {
    placements: { show: placementPath, departure: departurePaths },
  },
} = paths

type DepartureFormErrors = {
  [K in keyof DepartureFormData]?: string
}

type FormPageData = {
  token: string
  premisesId: string
  placementId: string
  placement: Cas1SpaceBooking
  departureFormSessionData: DepartureFormData
  errorsAndUserInput: ErrorsAndUserInput
}

const isMoveOnReason = [PLANNED_MOVE_ON_REASON_ID, LICENCE_EXPIRED_REASON_ID, BED_WITHDRAWN_REASON_ID]

export default class DeparturesController {
  formData: MultiPageFormManager<'departures'>

  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {
    this.formData = new MultiPageFormManager('departures')
  }

  private async getFormPageData(req: Request): Promise<FormPageData> {
    const { token } = req.user
    const { premisesId, placementId } = req.params
    const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
    const errorsAndUserInput = fetchErrorsAndUserInput(req)
    const departureFormSessionData = this.formData.get(placementId, req.session)

    return {
      token,
      premisesId,
      placementId,
      placement,
      errorsAndUserInput,
      departureFormSessionData,
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        token,
        premisesId,
        placementId,
        placement,
        departureFormSessionData,
        errorsAndUserInput: { userInput, ...errorsData },
      } = await this.getFormPageData(req)

      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(
        reason => !reason.parentReasonId,
      )

      return res.render('manage/premises/placements/departure/new', {
        backlink: placementPath({ premisesId, placementId }),
        placement,
        departureReasons,
        ...errorsData,
        ...departureFormSessionData,
        ...userInput,
      })
    }
  }

  private newErrors(body: DepartureFormData, placement: Cas1SpaceBooking): DepartureFormErrors | null {
    const errors: DepartureFormErrors = {}

    const { departureTime, departureDate, reasonId } = body

    if (!departureDate) {
      errors['departureDate-day'] = 'You must enter a date of departure'
    } else if (!dateAndTimeInputsAreValidDates(body as ObjectWithDateParts<'departureDate'>, 'departureDate')) {
      errors['departureDate-day'] = 'You must enter a valid date of departure'
    } else if (!dateIsPast(departureDate) && !isToday(departureDate)) {
      errors['departureDate-day'] = 'The date of departure must be today or in the past'
    } else if (isBefore(departureDate, placement.actualArrivalDate)) {
      const actualArrivalDate = DateFormats.isoDateToUIDate(placement.actualArrivalDate, { format: 'short' })
      errors['departureDate-day'] =
        `The date of departure must be the same as or after ${actualArrivalDate}, when the person arrived`
    } else if (isPast(addDays(departureDate, 7))) {
      errors['departureDate-day'] = 'The date of departure must not be more than 7 days ago'
    }

    if (!departureTime) {
      errors.departureTime = 'You must enter a time of departure'
    } else if (!timeIsValid24hrFormat(departureTime)) {
      errors.departureTime = 'You must enter a valid time of departure in 24-hour format'
    } else if (isToday(departureDate)) {
      const departureDateObj = isoDateAndTimeToDateObj(departureDate, departureTime)
      if (!isPast(departureDateObj)) {
        errors.departureTime = 'The time of departure must be in the past'
      }
    } else if (departureDate === placement.actualArrivalDate) {
      const departureDateObj = isoDateAndTimeToDateObj(departureDate, departureTime)
      const arrivalDateObj = isoDateAndTimeToDateObj(placement.actualArrivalDate, placement.actualArrivalTime)
      if (isBefore(departureDateObj, arrivalDateObj)) {
        errors.departureTime = `The time of departure must be after the time of arrival, ${placement.actualArrivalTime} on ${DateFormats.isoDateToUIDate(placement.actualArrivalDate, { format: 'short' })}`
      }
    }

    if (!reasonId) {
      errors.reasonId = 'You must select a reason'
    }

    return Object.keys(errors).length ? errors : null
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { premisesId, placementId },
        session,
        body,
        user: { token },
      } = req
      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })

      try {
        body.departureDate = DateFormats.dateAndTimeInputsToIsoString(
          body as ObjectWithDateParts<'departureDate'>,
          'departureDate',
        ).departureDate
        const errors = this.newErrors(body, placement)

        if (errors) {
          throw new ValidationError(errors)
        }

        await this.formData.update(placementId, session, body)

        let redirect = departurePaths.notes({ premisesId, placementId })

        if ([BREACH_OR_RECALL_REASON_ID].includes(body.reasonId)) {
          redirect = departurePaths.breachOrRecallReason({ premisesId, placementId })
        }

        if (isMoveOnReason.includes(body.reasonId)) {
          redirect = departurePaths.moveOnCategory({ premisesId, placementId })
        }

        return res.redirect(redirect)
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          departurePaths.new({ premisesId, placementId }),
        )
      }
    }
  }

  breachOrRecallReason(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        token,
        premisesId,
        placementId,
        placement,
        departureFormSessionData,
        errorsAndUserInput: { userInput, ...errorsData },
      } = await this.getFormPageData(req)

      if (
        !departureFormSessionData ||
        this.newErrors(departureFormSessionData, placement) ||
        departureFormSessionData.reasonId !== BREACH_OR_RECALL_REASON_ID
      ) {
        return res.redirect(departurePaths.new({ premisesId, placementId }))
      }

      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(
        reason => reason.parentReasonId === BREACH_OR_RECALL_REASON_ID,
      )

      return res.render('manage/premises/placements/departure/breach-or-recall', {
        backlink: departurePaths.new({ premisesId, placementId }),
        placement,
        departureReasons,
        ...errorsData,
        ...departureFormSessionData,
        ...userInput,
      })
    }
  }

  saveBreachOrRecallReason(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { breachOrRecallReasonId } = req.body

        if (!breachOrRecallReasonId) {
          throw new ValidationError({ breachOrRecallReasonId: 'You must select a breach or recall reason' })
        }

        await this.formData.update(placementId, req.session, req.body)

        return res.redirect(departurePaths.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          departurePaths.breachOrRecallReason({ premisesId, placementId }),
        )
      }
    }
  }

  moveOnCategory(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        token,
        premisesId,
        placementId,
        placement,
        departureFormSessionData,
        errorsAndUserInput: { userInput, ...errorsData },
      } = await this.getFormPageData(req)
      if (
        !departureFormSessionData ||
        this.newErrors(departureFormSessionData, placement) ||
        !isMoveOnReason.includes(departureFormSessionData.reasonId)
      ) {
        return res.redirect(departurePaths.new({ premisesId, placementId }))
      }

      const moveOnCategories = await this.placementService.getMoveOnCategories(token)
      const premisesSummaries = await this.premisesService.getCas1All(token)
      return res.render('manage/premises/placements/departure/move-on-category', {
        backlink: departurePaths.new({ premisesId, placementId }),
        premisesSummaries,
        MOVE_TO_AP_REASON_ID,
        placement,
        moveOnCategories,
        ...errorsData,
        ...departureFormSessionData,
        ...userInput,
      })
    }
  }

  saveMoveOnCategory(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { moveOnCategoryId, apName } = req.body

        if (!moveOnCategoryId) {
          throw new ValidationError({ moveOnCategoryId: 'You must select a move on category' })
        }

        if (moveOnCategoryId === MOVE_TO_AP_REASON_ID && !apName) {
          throw new ValidationError({ apName: 'You must select the destination AP' })
        }

        await this.formData.update(placementId, req.session, req.body)

        return res.redirect(departurePaths.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          departurePaths.moveOnCategory({ premisesId, placementId }),
        )
      }
    }
  }

  notes(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        premisesId,
        placementId,
        placement,
        departureFormSessionData,
        errorsAndUserInput: { userInput, ...errorsData },
      } = await this.getFormPageData(req)

      if (!departureFormSessionData || this.newErrors(departureFormSessionData, placement)) {
        return res.redirect(departurePaths.new({ premisesId, placementId }))
      }

      let backlink = departurePaths.new({ premisesId, placementId })
      if (departureFormSessionData.reasonId === BREACH_OR_RECALL_REASON_ID) {
        backlink = departurePaths.breachOrRecallReason({ premisesId, placementId })
      } else if (isMoveOnReason.includes(departureFormSessionData.reasonId)) {
        backlink = departurePaths.moveOnCategory({ premisesId, placementId })
      }
      return res.render('manage/premises/placements/departure/notes', {
        backlink,
        placement,
        ...errorsData,
        ...departureFormSessionData,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const departureData = this.formData.get(placementId, req.session)
      let { notes } = req.body

      try {
        let { reasonId, moveOnCategoryId } = departureData
        const { apName } = departureData

        if (reasonId === BREACH_OR_RECALL_REASON_ID) {
          reasonId = departureData.breachOrRecallReasonId
        }

        if (!isMoveOnReason.includes(reasonId)) {
          moveOnCategoryId = undefined
        } else if (moveOnCategoryId === MOVE_TO_AP_REASON_ID) {
          notes = `Transferred to AP: ${apName}\n\n${notes}`
        }

        const placementDeparture: Cas1NewDeparture = {
          departureDate: departureData.departureDate,
          departureTime: timeAddLeadingZero(departureData.departureTime),
          reasonId,
          moveOnCategoryId,
          notes,
        }

        await this.placementService.createDeparture(req.user.token, premisesId, placementId, placementDeparture)

        await this.formData.remove(placementId, req.session)
        req.flash('success', 'You have recorded this person as departed')

        return res.redirect(placementPath({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          departurePaths.notes({ premisesId, placementId }),
        )
      }
    }
  }
}
