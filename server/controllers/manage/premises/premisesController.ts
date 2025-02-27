import type { Request, RequestHandler, Response } from 'express'

import { ApArea, Cas1SpaceBookingSummarySortField, SortDirection } from '@approved-premises/api'
import { ApAreaService, PremisesService } from '../../../services'
import managePaths from '../../../paths/manage'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import { hasPermission } from '../../../utils/users'
import { PremisesTab, premisesOverbookingSummary, summaryListForPremises } from '../../../utils/premises'

type TabSettings = {
  pageSize: number
  sortBy: Cas1SpaceBookingSummarySortField
  sortDirection: SortDirection
}

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly apAreaService: ApAreaService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tabSettings: Record<PremisesTab, TabSettings> = {
        upcoming: { pageSize: 20, sortBy: 'canonicalArrivalDate', sortDirection: 'asc' },
        current: { pageSize: 2000, sortBy: 'personName', sortDirection: 'asc' },
        historic: { pageSize: 20, sortBy: 'canonicalDepartureDate', sortDirection: 'desc' },
        search: { pageSize: 20, sortBy: 'canonicalArrivalDate', sortDirection: 'desc' },
      }
      const { crnOrName, keyworker, activeTab = 'current' } = req.query as Record<string, string>
      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<Cas1SpaceBookingSummarySortField>(
        req,
        managePaths.premises.show({ premisesId: req.params.premisesId }),
        { activeTab, crnOrName, keyworker },
      )

      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      const showPlacements =
        premises.supportsSpaceBookings && hasPermission(res.locals.user, ['cas1_space_booking_list'])
      const keyworkersList =
        showPlacements && (activeTab === 'upcoming' || activeTab === 'current')
          ? await this.premisesService.getKeyworkers(req.user.token, req.params.premisesId)
          : undefined
      const paginatedPlacements =
        showPlacements &&
        (activeTab !== 'search' || Boolean(crnOrName)) &&
        (await this.premisesService.getPlacements({
          token: req.user.token,
          premisesId: req.params.premisesId,
          status: activeTab !== 'search' ? activeTab : undefined,
          crnOrName,
          keyWorkerStaffCode: keyworker || undefined,
          page: pageNumber || 1,
          perPage: tabSettings[activeTab].pageSize,
          sortBy: sortBy || tabSettings[activeTab].sortBy,
          sortDirection: sortDirection || tabSettings[activeTab].sortDirection,
        }))

      return res.render('manage/premises/show', {
        premises,
        summaryList: summaryListForPremises(premises),
        showPlacements,
        activeTab,
        crnOrName,
        keyworker,
        placements: paginatedPlacements?.data,
        keyworkersList,
        hrefPrefix,
        sortBy: sortBy || tabSettings[activeTab].sortBy,
        sortDirection: sortDirection || tabSettings[activeTab].sortDirection,
        pageNumber: Number(paginatedPlacements?.pageNumber) || undefined,
        totalPages: Number(paginatedPlacements?.totalPages) || undefined,
        premisesOverbookingSummary: premisesOverbookingSummary(premises),
        viewSpacesLink: managePaths.premises.occupancy.view({ premisesId: premises.id }),
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
