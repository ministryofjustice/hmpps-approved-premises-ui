import type { Request, RequestHandler, Response } from 'express'
import { addDays, isBefore } from 'date-fns'
import { TransferFormData } from '@approved-premises/ui'
import { Cas1NewEmergencyTransfer } from '@approved-premises/api'
import { Params } from 'static-path'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import { dateAndTimeInputsAreValidDates, DateFormats } from '../../../../utils/dateUtils'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'
import { allApprovedPremisesOptions, transferSummaryList } from '../../../../utils/placements/transfers'

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

  private validateNew(req: Request, res: Response, body: TransferFormData = {}): void {
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

      if (isBefore(transferDate, oneWeekAgo) || !isBefore(transferDate, tomorrow)) {
        errors.transferDate = 'The date of transfer must be today or in the last 7 days'
      }
    }

    if (Object.keys(errors).length) {
      throw new ValidationError(errors, managePaths.premises.placements.transfers.new(req.params as Params<string>))
    }

    return undefined
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        this.validateNew(req, res, req.body)

        await this.formData.update(placementId, req.session, req.body)

        return res.redirect(managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect ||
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

      try {
        this.validateNew(req, res, formData)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, error.redirect)
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

  private validateEmergencyDetails(req: Request, res: Response, body: TransferFormData = {}): void {
    const errors: Record<string, string> = {}

    if (!body.destinationPremisesId) {
      errors.destinationPremisesId = 'You must select aa Approved Premises for the person to be transferred to'
    }

    const { placementEndDate } = DateFormats.dateAndTimeInputsToIsoString(body, 'placementEndDate')

    if (!placementEndDate) {
      errors.placementEndDate = 'You must enter a placement end date'
    } else if (!dateAndTimeInputsAreValidDates(body, 'placementEndDate')) {
      errors.placementEndDate = 'You must enter a valid placement end date'
    } else {
      const { transferDate } = this.formData.get(req.params.placementId, req.session)

      if (isBefore(placementEndDate, transferDate) || placementEndDate === transferDate) {
        errors.placementEndDate = `The placement end date must be after the transfer date, ${DateFormats.isoDateToUIDate(transferDate, { format: 'short' })}`
      }
    }

    if (Object.keys(errors).length) {
      throw new ValidationError(
        errors,
        managePaths.premises.placements.transfers.emergencyDetails(req.params as Params<string>),
      )
    }

    return undefined
  }

  saveEmergencyDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)

      try {
        this.validateNew(req, res, formData)
        this.validateEmergencyDetails(req, res, req.body)

        const destinationPremises = await this.premisesService.find(req.user.token, req.body.destinationPremisesId)

        await this.formData.update(placementId, req.session, {
          ...req.body,
          destinationPremisesName: destinationPremises.name,
        })

        return res.redirect(managePaths.premises.placements.transfers.confirm({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect ||
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

      try {
        this.validateNew(req, res, formData)
        this.validateEmergencyDetails(req, res, formData)
      } catch (error) {
        return catchValidationErrorOrPropogate(req, res, error, error.redirect)
      }

      return res.render('manage/premises/placements/transfers/confirm', {
        backlink: managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }),
        pageHeading: 'Check the details of the transfer',
        placement,
        summaryList: transferSummaryList(formData),
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const formData = this.formData.get(placementId, req.session)

      try {
        this.validateNew(req, res, formData)
        this.validateEmergencyDetails(req, res, formData)

        const newEmergencyTransfer: Cas1NewEmergencyTransfer = {
          arrivalDate: formData.transferDate,
          departureDate: formData.placementEndDate,
          destinationPremisesId: formData.destinationPremisesId,
        }

        await this.placementService.createEmergencyTransfer(
          req.user.token,
          premisesId,
          placementId,
          newEmergencyTransfer,
        )

        await this.formData.remove(placementId, req.session)

        req.flash('success', {
          heading: 'Emergency transfer recorded',
          body: '<p>You must now record the person as departed, and use the move-on category for transfer.</p>',
        })

        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          error.redirect || managePaths.premises.placements.transfers.confirm({ premisesId, placementId }),
        )
      }
    }
  }
}
