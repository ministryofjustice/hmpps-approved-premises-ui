import type { Request, RequestHandler, Response } from 'express'
import { addDays } from 'date-fns'
import { TransferFormData } from '@approved-premises/ui'
import { Cas1NewEmergencyTransfer } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import {
  dateAndTimeInputsAreValidDates,
  DateFormats,
  dateIsToday,
  datetimeIsInThePast,
} from '../../../../utils/dateUtils'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'
import { allApprovedPremisesOptions, transferRequestSummaryList } from '../../../../utils/placements/transfers'

export default class TransfersController {
  formData: MultiPageFormManager<'transfers'>

  constructor(
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
  ) {
    this.formData = new MultiPageFormManager('transfers')
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      return res.render('manage/premises/placements/transfers/new', {
        backlink: managePaths.premises.placements.show({ premisesId, placementId }),
        pageHeading: 'Request a transfer',
        placement,
        errors,
        errorSummary,
        ...formData,
        ...userInput,
      })
    }
  }

  private getSaveNewErrors(body: TransferFormData) {
    const errors: Record<string, string> = {}

    const { transferDate } = DateFormats.dateAndTimeInputsToIsoString(body, 'transferDate')

    if (!transferDate) {
      errors.transferDate = 'You must enter a transfer date'
    } else if (!dateAndTimeInputsAreValidDates(body, 'transferDate')) {
      errors.transferDate = 'You must enter a valid transfer date'
    } else {
      // TODO: this validation will need to be updated when standard transfers are added.
      const oneWeekAgo = DateFormats.dateObjToIsoDate(addDays(new Date(), -7))
      const tomorrow = DateFormats.dateObjToIsoDate(addDays(new Date(), 1))

      if (datetimeIsInThePast(transferDate, oneWeekAgo) || !datetimeIsInThePast(transferDate, tomorrow)) {
        errors.transferDate = 'The date of transfer must be today or in the last 7 days'
      }
    }

    return Object.keys(errors).length ? errors : undefined
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const errors = this.getSaveNewErrors(req.body)

        if (errors) {
          throw new ValidationError(errors)
        }

        this.formData.update(placementId, req.session, req.body)

        return req.session.save(() => {
          res.redirect(managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }))
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.transfers.new({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  emergencyDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(token, placementId)
      const approvedPremises = await this.premisesService.getCas1All(token)

      const formData = this.formData.get(placementId, req.session)

      if (!formData || this.getSaveNewErrors(formData)) {
        return res.redirect(managePaths.premises.placements.transfers.new({ premisesId, placementId }))
      }

      return res.render('manage/premises/placements/transfers/emergency-details', {
        backlink: managePaths.premises.placements.transfers.new({ premisesId, placementId }),
        pageHeading: 'Enter the emergency transfer details',
        placement,
        approvedPremisesOptions: allApprovedPremisesOptions(approvedPremises),
        errors,
        errorSummary,
        ...formData,
        ...userInput,
      })
    }
  }

  private getSaveEmergencyDetailsErrors(req: Request, placementId: string) {
    const errors: Record<string, string> = {}

    if (!req.body.destinationPremisesId) {
      errors.destinationPremisesId = 'You must select aa Approved Premises for the person to be transferred to'
    }

    const { placementEndDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'placementEndDate')

    if (!placementEndDate) {
      errors.placementEndDate = 'You must enter a placement end date'
    } else if (!dateAndTimeInputsAreValidDates(req.body, 'placementEndDate')) {
      errors.placementEndDate = 'You must enter a valid placement end date'
    } else {
      const { transferDate } = this.formData.get(placementId, req.session)

      if (datetimeIsInThePast(placementEndDate, transferDate) || dateIsToday(placementEndDate, transferDate)) {
        errors.placementEndDate = `The placement end date must be after the transfer date, ${DateFormats.isoDateToUIDate(transferDate, { format: 'short' })}`
      }
    }

    return Object.keys(errors).length ? errors : undefined
  }

  saveEmergencyDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const errors = this.getSaveEmergencyDetailsErrors(req, placementId)

        if (errors) {
          throw new ValidationError(errors)
        }

        const destinationPremises = await this.premisesService.find(req.user.token, req.body.destinationPremisesId)

        this.formData.update(placementId, req.session, {
          ...req.body,
          destinationPremisesName: destinationPremises.name,
        })

        return req.session.save(() => {
          res.redirect(managePaths.premises.placements.transfers.confirm({ premisesId, placementId }))
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.transfers.emergencyDetails({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      if (!formData) {
        return res.redirect(managePaths.premises.placements.transfers.new({ premisesId, placementId }))
      }

      return res.render('manage/premises/placements/transfers/confirm', {
        backlink: managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }),
        pageHeading: 'Check the details of the transfer',
        placement,
        summaryList: transferRequestSummaryList(formData),
        errors,
        errorSummary,
        ...formData,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)

      try {
        const transferRequest: Cas1NewEmergencyTransfer = {
          arrivalDate: formData.transferDate,
          departureDate: formData.placementEndDate,
          destinationPremisesId: formData.destinationPremisesId,
        }

        await this.placementService.createEmergencyTransfer(req.user.token, premisesId, placementId, transferRequest)

        this.formData.remove(placementId, req.session)
        req.flash('success', {
          heading: 'Emergency transfer recorded',
          body: 'You must now record the person as departed, and use the move-on category for transfer.',
        })

        return req.session.save(() => {
          res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.transfers.confirm({ premisesId, placementId }),
        )
      }
    }
  }
}
