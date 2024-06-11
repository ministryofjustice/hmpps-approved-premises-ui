import type { Request, RequestHandler, Response } from 'express'

import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'
import paths from '../../paths/manage'
import { DateFormats } from '../../utils/dateUtils'
import { SanitisedError } from '../../sanitisedError'
import OutOfServiceBedService from '../../services/outOfServiceBedService'

export default class OutOfServiceBedsController {
  constructor(private readonly outOfServiceBedService: OutOfServiceBedService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      return res.render('outOfServiceBeds/new', {
        premisesId,
        bedId,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId } = req.params

      const { outOfServiceFrom } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'outOfServiceFrom')
      const { outOfServiceTo } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'outOfServiceTo')

      const outOfServiceBed = {
        ...req.body.outOfServiceBed,
        bedId,
        outOfServiceFrom,
        outOfServiceTo,
      }

      try {
        await this.outOfServiceBedService.createOutOfServiceBed(req.user.token, premisesId, outOfServiceBed)

        req.flash('success', 'Out of service bed logged')
        return res.redirect(paths.premises.show({ premisesId }))
      } catch (error) {
        const redirectPath = paths.v2Manage.outOfServiceBeds.new({ premisesId, bedId })

        const knownError = error as SanitisedError

        if (knownError.status === 409 && 'data' in knownError) {
          return generateConflictErrorAndRedirect(
            req,
            res,
            premisesId,
            ['outOfServiceFrom', 'outOfServiceTo'],
            knownError,
            redirectPath,
            bedId,
          )
        }

        return catchValidationErrorOrPropogate(req, res, knownError, redirectPath)
      }
    }
  }

  premisesIndex(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const outOfServiceBeds = await this.outOfServiceBedService.getOutOfServiceBedsForAPremises(
        req.user.token,
        premisesId,
      )

      return res.render('outOfServiceBeds/premisesIndex', {
        outOfServiceBeds,
        pageHeading: 'Manage out of service beds',
        premisesId,
      })
    }
  }

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const pageNumber = req.query.page ? Number(req.query.page) : undefined

      const outOfServiceBeds = await this.outOfServiceBedService.getAllOutOfServiceBeds(req.user.token, pageNumber)

      return res.render('outOfServiceBeds/index', {
        pageHeading: 'View out of service beds',
        outOfServiceBeds: outOfServiceBeds.data,
        pageNumber: Number(outOfServiceBeds.pageNumber),
        totalPages: Number(outOfServiceBeds.totalPages),
        hrefPrefix: `${paths.v2Manage.outOfServiceBeds.index({})}?`,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, id } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const referrer = req.headers.referer

      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)

      return res.render('outOfServiceBeds/show', {
        errors,
        errorSummary,
        outOfServiceBed,
        premisesId,
        referrer,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, id } = req.params

      const { outOfServiceTo } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'outOfServiceTo')
      req.body.outOfServiceTo = outOfServiceTo

      try {
        if (req.body.cancel === '1') {
          await this.outOfServiceBedService.cancelOutOfServiceBed(req.user.token, id, premisesId, {
            notes: req.body.notes,
          })

          req.flash('success', 'Bed cancelled')

          return res.redirect(paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId }))
        }

        await this.outOfServiceBedService.updateOutOfServiceBed(req.user.token, id, premisesId, req.body)

        req.flash('success', 'Bed updated')

        return res.redirect(paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId }))
      } catch (error) {
        const redirectPath = req.headers.referer

        return catchValidationErrorOrPropogate(req, res, error as Error, redirectPath)
      }
    }
  }

  cancel(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params
      const { notes = '' } = req.body

      try {
        await this.outOfServiceBedService.cancelOutOfServiceBed(req.user.token, id, premisesId, { notes })

        req.flash('success', 'Bed cancelled')

        return res.redirect(paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.v2Manage.outOfServiceBeds.show({ premisesId, bedId, id }),
        )
      }
    }
  }
}
