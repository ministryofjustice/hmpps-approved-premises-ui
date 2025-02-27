import type { Request, RequestHandler, Response } from 'express'
import type { ApprovedPremisesApplication, ApprovedPremisesAssessment, Cas1TimelineEvent } from '@approved-premises/api'
import { SummaryListItem } from '@approved-premises/ui'
import {
  ApplicationService,
  AssessmentService,
  PlacementRequestService,
  PlacementService,
  PremisesService,
  SessionService,
} from '../../services'

import { DateFormats } from '../../utils/dateUtils'
import { PlacementTab, placementTabItems } from '../../utils/placements'
import { mapApplicationTimelineEventsForUi } from '../../utils/applications/utils'
import paths from '../../paths/manage'
import applicationPaths from '../../paths/apply'
import peoplePaths from '../../paths/people'
import { matchingInformationSummaryRows } from '../../utils/placementRequests/matchingInformationSummaryList'
import { adminSummary } from '../../utils/placementRequests'

export default class PlacementController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly assessmentService: AssessmentService,
    private readonly placementRequestService: PlacementRequestService,
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
    private readonly sessionService: SessionService,
  ) {}

  show(activeTab: PlacementTab = 'placement'): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { user } = res.locals

      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })
      const isOfflineApplication = !placement.assessmentId
      const tabItems = placementTabItems(placement, activeTab, isOfflineApplication)
      const backLink = this.sessionService.getPageBackLink(paths.premises.placements.show.pattern, req, [
        paths.premises.show.pattern,
        paths.premises.occupancy.day.pattern,
        applicationPaths.applications.show.pattern,
        peoplePaths.timeline.show.pattern,
      ])
      const pageHeading = `${DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' })}`
      let timelineEvents: Array<Cas1TimelineEvent> = []
      let application: ApprovedPremisesApplication = null
      let assessment: ApprovedPremisesAssessment = null
      let placementRequestSummaryRows: Array<SummaryListItem> = null

      if (activeTab === 'timeline') {
        timelineEvents = await this.placementService.getTimeline({ token: req.user.token, premisesId, placementId })
      }
      if (activeTab === 'application') {
        application = await this.applicationService.findApplication(req.user.token, placement.applicationId)
      }
      if (activeTab === 'assessment') {
        assessment = await this.assessmentService.findAssessment(req.user.token, placement.assessmentId)
      }
      if (activeTab === 'placementRequest') {
        const placementRequestDetail = await this.placementRequestService.getPlacementRequest(
          req.user.token,
          placement.placementRequestId,
        )
        placementRequestSummaryRows = [
          ...adminSummary(placementRequestDetail).rows,
          ...matchingInformationSummaryRows(placementRequestDetail),
        ]
      }

      return res.render(`manage/premises/placements/show`, {
        placement,
        pageHeading,
        user,
        backLink,
        tabItems,
        timelineEvents: mapApplicationTimelineEventsForUi(timelineEvents).map(event => ({
          ...event,
          associatedUrls: null,
        })),
        activeTab,
        application,
        assessment,
        placementRequestSummaryRows,
        showTitle: true,
        isOfflineApplication,
      })
    }
  }
}
