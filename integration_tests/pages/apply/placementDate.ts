import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'
import { DateFormats } from '../../../server/utils/dateUtils'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../server/utils/retrieveQuestionResponseFromFormArtifact'
import ReleaseDate from '../../../server/form-pages/apply/reasons-for-placement/basic-information/releaseDate'
import paths from '../../../server/paths/apply'

export default class PlacementStartPage extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly releaseDatePast: boolean,
  ) {
    const releaseDate = retrieveOptionalQuestionResponseFromFormArtifact(application, ReleaseDate) as string
    const title = releaseDatePast
      ? 'What date you want the placement to start?'
      : `Is ${DateFormats.isoDateToUIDate(releaseDate)} the date you want the placement to start?`

    const newApplication = application

    super(
      title,
      newApplication,
      'basic-information',
      'placement-date',
      paths.applications.pages.show({ id: application.id, page: 'release-date', task: 'basic-information' }),
    )
  }

  completeForm() {
    if (this.releaseDatePast && this.tasklistPage.body.startDate) {
      this.completeDateInputsFromPageBody('startDate')
    } else {
      this.checkRadioButtonFromPageBody('startDateSameAsReleaseDate')
    }
  }
}
