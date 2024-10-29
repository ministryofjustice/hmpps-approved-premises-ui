import type { Request, RequestHandler, Response } from 'express'

import { ApArea, Cas1SpaceBookingSummarySortField } from '@approved-premises/api'
import { ApAreaService, PremisesService } from '../../../services'
import managePaths from '../../../paths/manage'
import { getPaginationDetails } from '../../../utils/getPaginationDetails'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly apAreaService: ApAreaService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { activeTab } = req.query
      const { pageNumber, sortBy, sortDirection, hrefPrefix } = getPaginationDetails<Cas1SpaceBookingSummarySortField>(
        req,
        managePaths.premises.show({ premisesId: req.params.premisesId }),
        { activeTab },
        'canonicalArrivalDate',
      )

      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      const perPage = activeTab === 'current' ? 2000 : 2

      const paginatedPlacements = await this.premisesService.getPlacements(
        req.user.token,
        req.params.premisesId,
        activeTab as string,
        pageNumber,
        perPage,
        sortBy,
        sortDirection,
      )
      return res.render('manage/premises/show', {
        premises,
        activeTab: activeTab || 'upcoming',
        placements: paginatedPlacements.data,
        hrefPrefix,
        sortBy: sortBy || 'canonicalDepartureDate',
        sortDirection,
        pageNumber: Number(paginatedPlacements.pageNumber),
        totalPages: Number(paginatedPlacements.totalPages),
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
