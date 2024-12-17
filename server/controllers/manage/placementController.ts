import type { Request, RequestHandler, Response } from 'express'
import type {
  ApprovedPremisesApplication,
  ApprovedPremisesAssessment,
  PlacementRequestDetail,
  TimelineEvent,
} from '@approved-premises/api'
import {
  ApplicationService,
  AssessmentService,
  PlacementRequestService,
  PlacementService,
  PremisesService,
} from '../../services'

import { DateFormats } from '../../utils/dateUtils'
import { PlacementTab, getBackLink, placementTabItems } from '../../utils/placements'
import { mapApplicationTimelineEventsForUi } from '../../utils/applications/utils'

export default class PlacementController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly assessmentService: AssessmentService,
    private readonly placementRequestService: PlacementRequestService,
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
  ) {}

  show(activeTab: PlacementTab = 'placement'): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { user } = res.locals

      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })
      const tabItems = placementTabItems(placement, activeTab)
      const backLink = getBackLink(req.headers.referer, premisesId)
      const pageHeading = `${DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' })}`
      let timelineEvents: Array<TimelineEvent> = []
      let application: ApprovedPremisesApplication = null
      let assessment: ApprovedPremisesAssessment = null
      let placementRequestDetail: PlacementRequestDetail = null
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
        placementRequestDetail = await this.placementRequestService.getPlacementRequest(
          req.user.token,
          placement.requestForPlacementId,
        )
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
        placementRequestDetail,
        showTitle: true,
      })
    }
  }
}
