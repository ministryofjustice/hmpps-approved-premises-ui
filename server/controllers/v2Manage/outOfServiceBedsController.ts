import type { Request, RequestHandler, Response } from 'express'

import { Cas1OutOfServiceBedSortField as OutOfServiceBedSortField, Temporality } from '@approved-premises/api'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'
import paths from '../../paths/manage'
import { DateFormats } from '../../utils/dateUtils'
import { SanitisedError } from '../../sanitisedError'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { OutOfServiceBedService, PremisesService } from '../../services'
import { sortOutOfServiceBedRevisionsByUpdatedAt } from '../../utils/outOfServiceBedUtils'
import { translateCharacteristic } from '../../utils/characteristicsUtils'

export default class OutOfServiceBedsController {
  constructor(
    private readonly outOfServiceBedService: OutOfServiceBedService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const outOfServiceBedReasons = await this.outOfServiceBedService.getOutOfServiceBedReasons(req.user.token)
      return res.render('v2Manage/outOfServiceBeds/new', {
        premisesId,
        bedId,
        outOfServiceBedReasons,
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

      const { startDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'startDate')
      const { endDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate')

      const outOfServiceBed = {
        ...req.body.outOfServiceBed,
        bedId,
        startDate,
        endDate,
      }

      try {
        await this.outOfServiceBedService.createOutOfServiceBed(req.user.token, premisesId, outOfServiceBed)

        req.flash('success', 'The out of service bed has been recorded')
        return res.redirect(paths.v2Manage.premises.beds.show({ premisesId, bedId }))
      } catch (error) {
        const redirectPath = paths.v2Manage.outOfServiceBeds.new({ premisesId, bedId })

        const knownError = error as SanitisedError

        if (knownError.status === 409 && 'data' in knownError) {
          return generateConflictErrorAndRedirect(
            req,
            res,
            premisesId,
            ['startDate', 'endDate'],
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
      const { temporality, premisesId } = req.params as { temporality: Temporality; premisesId: string }

      if (!['current', 'future', 'past'].includes(temporality)) {
        return res.redirect(paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }))
      }

      const { pageNumber, hrefPrefix } = getPaginationDetails<OutOfServiceBedSortField>(
        req,
        paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId, temporality }),
        {
          temporality,
          premisesId,
        },
      )

      const outOfServiceBeds = await this.outOfServiceBedService.getAllOutOfServiceBeds({
        token: req.user.token,
        premisesId,
        temporality,
        page: pageNumber,
        perPage: 50,
      })

      return res.render('v2Manage/outOfServiceBeds/premisesIndex', {
        outOfServiceBeds: outOfServiceBeds.data,
        pageHeading: 'Manage out of service beds',
        premisesId,
        temporality,
        pageNumber: Number(outOfServiceBeds.pageNumber),
        totalPages: Number(outOfServiceBeds.totalPages),
        hrefPrefix,
      })
    }
  }

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { temporality } = req.params as { temporality: Temporality }

      if (!['current', 'future', 'past'].includes(temporality)) {
        return res.redirect(paths.v2Manage.outOfServiceBeds.index({ temporality: 'current' }))
      }

      const { premisesId, apAreaId } = req.query as {
        premisesId: string
        apAreaId: string
      }

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationDetails<OutOfServiceBedSortField>(
        req,
        paths.v2Manage.outOfServiceBeds.index({ temporality }),
        {
          premisesId,
          apAreaId,
        },
      )

      const outOfServiceBeds = await this.outOfServiceBedService.getAllOutOfServiceBeds({
        token: req.user.token,
        page: pageNumber,
        sortBy,
        sortDirection,
        temporality,
        premisesId,
        apAreaId,
      })

      return res.render('v2Manage/outOfServiceBeds/index', {
        pageHeading: 'Out of service beds',
        outOfServiceBeds: outOfServiceBeds.data,
        pageNumber: Number(outOfServiceBeds.pageNumber),
        totalPages: Number(outOfServiceBeds.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
        temporality,
        premisesId,
        apAreaId,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id, tab = 'details' } = req.params
      const referrer = req.headers.referer

      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)

      outOfServiceBed.revisionHistory = sortOutOfServiceBedRevisionsByUpdatedAt(outOfServiceBed.revisionHistory)

      const { characteristics } = await this.premisesService.getBed(req.user.token, premisesId, bedId)
      const translatedCharacteristics = characteristics.map(characteristic => translateCharacteristic(characteristic))

      return res.render('v2Manage/outOfServiceBeds/show', {
        outOfServiceBed,
        premisesId,
        bedId,
        id,
        referrer,
        activeTab: tab,
        characteristics: translatedCharacteristics,
        pageHeading: `Out of service bed ${outOfServiceBed.room.name} ${outOfServiceBed.bed.name}`,
      })
    }
  }

  cancel(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params
      const { notes = '' } = req.body

      try {
        await this.outOfServiceBedService.cancelOutOfServiceBed(req.user.token, id, premisesId, { notes })

        req.flash('success', 'Out of service bed removed')

        return res.redirect(paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.v2Manage.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
        )
      }
    }
  }
}
