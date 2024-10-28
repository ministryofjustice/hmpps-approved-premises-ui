import type { Request, RequestHandler, Response } from 'express'
import {
  ApArea,
  Cas1SpaceBookingResidency,
  Cas1SpaceBookingSummarySortField,
  SortDirection,
} from '@approved-premises/api'
import { ApAreaService, PremisesService } from '../../../services'
import managePaths from '../../../paths/manage'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { hasPermission } from '../../../utils/users/roles'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly apAreaService: ApAreaService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tabSettings: Record<
        Cas1SpaceBookingResidency,
        { pageSize: number; sortBy: Cas1SpaceBookingSummarySortField; sortDirection: SortDirection }
      > = {
        upcoming: { pageSize: 20, sortBy: 'canonicalArrivalDate', sortDirection: 'asc' },
        current: { pageSize: 2000, sortBy: 'canonicalDepartureDate', sortDirection: 'asc' },
        historic: { pageSize: 20, sortBy: 'canonicalDepartureDate', sortDirection: 'desc' },
      }
      const activeTab = String(req.query.activeTab || 'upcoming')
      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<Cas1SpaceBookingSummarySortField>(
        req,
        managePaths.premises.show({ premisesId: req.params.premisesId }),
        { activeTab },
      )
      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      const paginatedPlacements =
        hasPermission(res.locals.user, ['cas1_space_booking_list']) &&
        (await this.premisesService.getPlacements({
          token: req.user.token,
          premisesId: req.params.premisesId,
          status: activeTab,
          page: pageNumber || 1,
          perPage: tabSettings[activeTab].pageSize,
          sortBy: sortBy || tabSettings[activeTab].sortBy,
          sortDirection: sortDirection || tabSettings[activeTab].sortDirection,
        }))

      return res.render('manage/premises/show', {
        premises,
        activeTab,
        placements: paginatedPlacements?.data,
        hrefPrefix,
        sortBy: sortBy || tabSettings[activeTab].sortBy,
        sortDirection: sortDirection || tabSettings[activeTab].sortDirection,
        pageNumber: Number(paginatedPlacements?.pageNumber),
        totalPages: Number(paginatedPlacements?.totalPages),
      })
    }
  }

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const selectedArea = req.body.selectedArea as ApArea['id']
      const premisesSummaries = await this.premisesService.getCas1All(
        req.user.token,
        selectedArea && { apAreaId: selectedArea },
      )
      const areas = await this.apAreaService.getApAreas(req.user.token)

      return res.render('manage/premises/index', {
        premisesSummaries,
        areas,
        selectedArea: selectedArea || '',
      })
    }
  }
}
