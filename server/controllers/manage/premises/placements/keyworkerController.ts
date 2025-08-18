import { type Request, RequestHandler, type Response } from 'express'
import { StaffMember } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import { PlacementService, PremisesService, UserService } from '../../../../services'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateErrorMessages,
  generateErrorSummary,
} from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import {
  placementKeyDetails,
  renderKeyworkersSelectOptions,
  renderKeyworkersRadioOptions,
} from '../../../../utils/placements'
import { keyworkersTableHead, keyworkersTableRows } from '../../../../utils/placements/keyworkers'
import { Pagination, pagination as buildPagination } from '../../../../utils/pagination'
import { createQueryString } from '../../../../utils/utils'

export default class KeyworkerController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
    private readonly userService: UserService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const [placement, currentKeyworkers] = await Promise.all([
        await this.premisesService.getPlacement({
          token,
          premisesId,
          placementId,
        }),
        await this.premisesService.getCurrentKeyworkers(token, premisesId),
      ])

      return res.render('manage/premises/placements/assignKeyworker/new', {
        contextKeyDetails: placementKeyDetails(placement),
        backlink: managePaths.premises.placements.show({ premisesId, placementId }),
        currentKeyworkerName: placement.keyWorkerAllocation?.keyWorkerUser?.name || 'Not assigned',
        keyworkersOptions: renderKeyworkersRadioOptions(currentKeyworkers, placement),
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { nameOrEmail, page = '1' } = req.query

      const placement = await this.premisesService.getPlacement({
        token,
        premisesId,
        placementId,
      })

      const errors: Record<string, string> = {}
      let tableRows: Array<TableRow>
      let pagination: Pagination

      if (nameOrEmail !== undefined) {
        if (!nameOrEmail) {
          errors.nameOrEmail = 'Enter a name or email'
        } else {
          const pageNumber = Number(page)
          const results = await this.userService.getUsersSummaries(token, {
            page: pageNumber,
            nameOrEmail: nameOrEmail as string,
            permission: 'cas1_keyworker_assignable_as',
          })
          tableRows = keyworkersTableRows(results.data)
          pagination = buildPagination(
            pageNumber,
            Number(results.totalPages),
            `${managePaths.premises.placements.keyworker.find({
              premisesId,
              placementId: placement.id,
            })}?${createQueryString({ nameOrEmail })}&`,
          )
        }
      }

      const assignKeyworkerPath = managePaths.premises.placements.keyworker.new({ premisesId, placementId })

      return res.render('manage/premises/placements/assignKeyworker/find', {
        contextKeyDetails: placementKeyDetails(placement),
        backlink: assignKeyworkerPath,
        submitUrl: assignKeyworkerPath,
        nameOrEmail,
        tableRows,
        tableHead: keyworkersTableHead,
        pagination,
        errors: generateErrorMessages(errors),
        errorSummary: generateErrorSummary(errors),
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { keyworker } = req.body

        if (!keyworker) {
          throw new ValidationError({
            keyworker: 'Select a keyworker',
          })
        }

        if (keyworker === 'new') {
          return res.redirect(managePaths.premises.placements.keyworker.find({ premisesId, placementId }))
        }

        await this.placementService.assignKeyworker(req.user.token, premisesId, placementId, { userId: keyworker })

        const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

        req.flash('success', {
          heading: 'Keyworker assigned',
          body: `You have assigned ${placement.keyWorkerAllocation.keyWorkerUser.name} to ${placement.person.crn}`,
        })
        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.keyworker.new({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  // TODO: Remove handler when new flow released (APS-2644)
  newDeprecated(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const keyworkers: Array<StaffMember> = await this.premisesService.getKeyworkers(token, premisesId)

      return res.render('manage/premises/placements/keyworker', {
        contextKeyDetails: placementKeyDetails(placement),
        currentKeyworkerName: placement.keyWorkerAllocation?.keyWorker?.name || 'Not assigned',
        keyworkersOptions: renderKeyworkersSelectOptions(keyworkers, placement),
        placement,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  // TODO: Remove handler when new flow released (APS-2644)
  assignDeprecated(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      try {
        const { staffCode } = req.body

        if (!staffCode) {
          throw new ValidationError({
            staffCode: 'You must select a keyworker',
          })
        }

        await this.placementService.assignKeyworker(req.user.token, premisesId, placementId, { staffCode })

        req.flash('success', 'Keyworker assigned')
        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.keyworkerDeprecated({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
