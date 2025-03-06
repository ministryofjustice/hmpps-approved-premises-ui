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
import { ApAreaService, OutOfServiceBedService, PremisesService, SessionService } from '../../services'
import { sortOutOfServiceBedRevisionsByUpdatedAt } from '../../utils/outOfServiceBedUtils'
import {
  characteristicsBulletList,
  characteristicsPairToCharacteristics,
  roomCharacteristicMap,
} from '../../utils/characteristicsUtils'

export default class OutOfServiceBedsController {
  constructor(
    private readonly outOfServiceBedService: OutOfServiceBedService,
    private readonly premisesService: PremisesService,
    private readonly apAreaService: ApAreaService,
    private readonly sessionService: SessionService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const outOfServiceBedReasons = await this.outOfServiceBedService.getOutOfServiceBedReasons(req.user.token)
      return res.render('manage/outOfServiceBeds/new', {
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
        return res.redirect(paths.premises.beds.show({ premisesId, bedId }))
      } catch (error) {
        const redirectPath = paths.outOfServiceBeds.new({ premisesId, bedId })

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
        return res.redirect(paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }))
      }

      const { pageNumber, hrefPrefix } = getPaginationDetails<OutOfServiceBedSortField>(
        req,
        paths.outOfServiceBeds.premisesIndex({ premisesId, temporality }),
        {
          temporality,
          premisesId,
        },
      )

      const [outOfServiceBeds, premises] = await Promise.all([
        this.outOfServiceBedService.getAllOutOfServiceBeds({
          token: req.user.token,
          premisesId,
          temporality,
          page: pageNumber,
          perPage: 50,
        }),
        this.premisesService.find(req.user.token, premisesId),
      ])
      const backLink = this.sessionService.getPageBackLink(paths.outOfServiceBeds.premisesIndex.pattern, req, [
        paths.premises.beds.index.pattern,
        paths.premises.show.pattern,
      ])

      return res.render('manage/outOfServiceBeds/premisesIndex', {
        backLink,
        outOfServiceBeds: outOfServiceBeds.data,
        pageHeading: 'Out of service beds',
        premises: { id: premisesId, name: premises.name },
        temporality,
        pageNumber: Number(outOfServiceBeds.pageNumber),
        totalPages: Number(outOfServiceBeds.totalPages),
        totalResults: Number(outOfServiceBeds.totalResults),
        hrefPrefix,
      })
    }
  }

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { temporality } = req.params as { temporality: Temporality }
      const apAreas = await this.apAreaService.getApAreas(req.user.token)
      let premises = await this.premisesService.getCas1All(req.user.token)
      let { apAreaId = '', premisesId = '' } = req.query as {
        apAreaId: string
        premisesId: string
      }

      let disablePremisesSelect = true

      const allPremises = premises
      if (!['current', 'future', 'past'].includes(temporality)) {
        return res.redirect(paths.outOfServiceBeds.index({ temporality: 'current' }))
      }

      if (apAreaId) {
        if (apAreaId !== 'all') {
          const apAreaSelected = apAreas.find(apArea => apArea.id === apAreaId)
          premises = premises.filter(item => item.apArea.name === apAreaSelected.name)
          disablePremisesSelect = false
        }
      }

      if (premisesId === 'all') {
        premisesId = ''
      }

      if (apAreaId === 'all') {
        apAreaId = ''
      }

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationDetails<OutOfServiceBedSortField>(
        req,
        paths.outOfServiceBeds.index({ temporality }),
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

      return res.render('manage/outOfServiceBeds/index', {
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
        apAreas,
        premises,
        disablePremisesSelect,
        allPremises,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id, tab = 'details' } = req.params
      const backLink = this.sessionService.getPageBackLink(paths.outOfServiceBeds.show.pattern, req, [
        paths.outOfServiceBeds.premisesIndex.pattern,
        paths.outOfServiceBeds.index.pattern,
        paths.premises.occupancy.day.pattern,
      ])

      const [outOfServiceBed, { characteristics }] = await Promise.all([
        this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id),
        this.premisesService.getBed(req.user.token, premisesId, bedId),
      ])

      outOfServiceBed.revisionHistory = sortOutOfServiceBedRevisionsByUpdatedAt(outOfServiceBed.revisionHistory)
      const characteristicsHtml = characteristicsBulletList(characteristicsPairToCharacteristics(characteristics), {
        labels: roomCharacteristicMap,
      })

      return res.render('manage/outOfServiceBeds/show', {
        outOfServiceBed,
        premisesId,
        bedId,
        id,
        backLink,
        activeTab: tab,
        characteristicsHtml,
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

        return res.redirect(paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
        )
      }
    }
  }
}
