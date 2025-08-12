import { ApprovedPremisesApplication as Application, PlacementApplication } from '../../@types/shared'
import { SummaryListWithCard } from '../../@types/ui'
import PlacementApplicationForm from '../../form-pages/placement-application'
import { forPagesInTask } from '../applications/forPagesInTask'
import { mapPageForSummaryList } from './reviewUtils'

export const mapTaskForSummaryList = (
  placementApplication: PlacementApplication,
  application: Application,
): Array<SummaryListWithCard> => {
  const pageSummaries: Array<SummaryListWithCard> = []
  const placementApplicationTask = PlacementApplicationForm.sections[0].tasks[0]

  forPagesInTask(placementApplication, placementApplicationTask, (_, pageName: string) => {
    pageSummaries.push(mapPageForSummaryList(placementApplication, pageName, application))
  })

  return pageSummaries
}
