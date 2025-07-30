import type { Request, RequestHandler, Response } from 'express'

import { Cas1CruManagementArea, Cas1SpaceBookingSummarySortField, SortDirection } from '@approved-premises/api'
import { CruManagementAreaService, PremisesService, SessionService } from '../../../services'
import managePaths from '../../../paths/manage'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'
import {
  PremisesTab,
  summaryListForPremises,
  premisesTableRows,
  premisesTableHead,
  premisesActions,
} from '../../../utils/premises'

type TabSettings = {
  pageSize: number
  sortBy: Cas1SpaceBookingSummarySortField
  sortDirection: SortDirection
}

interface ShowRequest extends Request {
  query: {
    crnOrName: string
    keyworker: string
    activeTab: PremisesTab
  }
}

interface IndexRequest extends Request {
  query: {
    selectedArea: Cas1CruManagementArea['id'] | 'all'
  }
}

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly cruManagementAreaService: CruManagementAreaService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (req: ShowRequest, res: Response) => {
      const tabSettings: Record<PremisesTab, TabSettings> = {
        upcoming: { pageSize: 20, sortBy: 'canonicalArrivalDate', sortDirection: 'asc' },
        current: { pageSize: 2000, sortBy: 'personName', sortDirection: 'asc' },
        historic: { pageSize: 20, sortBy: 'canonicalDepartureDate', sortDirection: 'desc' },
        search: { pageSize: 20, sortBy: 'canonicalArrivalDate', sortDirection: 'desc' },
      }
      const { crnOrName, keyworker, activeTab = 'current' } = req.query
      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<Cas1SpaceBookingSummarySortField>(
        req,
        managePaths.premises.show({ premisesId: req.params.premisesId }),
        { activeTab, crnOrName, keyworker },
      )

      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      const showPlacements = premises.supportsSpaceBookings
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
        backlink: this.sessionService.getPageBackLink(managePaths.premises.show.pattern, req, [
          managePaths.premises.index.pattern,
        ]),
        menuActions: premisesActions(res.locals.user, premises),
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
        viewSpacesLink: managePaths.premises.occupancy.view({ premisesId: premises.id }),
      })
    }
  }

  index(): RequestHandler {
    return async (req: IndexRequest, res: Response) => {
      const { user } = res.locals
      const selectedArea = req.query.selectedArea || user.cruManagementArea?.id
      const premisesSummaries = await this.premisesService.getCas1All(req.user.token, {
        cruManagementAreaId: selectedArea === 'all' ? undefined : selectedArea,
      })
      const areas = await this.cruManagementAreaService.getCruManagementAreas(req.user.token)

      return res.render('manage/premises/index', {
        tableHead: premisesTableHead,
        tableRows: premisesTableRows(premisesSummaries),
        areas,
        selectedArea,
      })
    }
  }
}
