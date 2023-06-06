import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'
import { DateFormats } from '../../../server/utils/dateUtils'
import { retrieveQuestionResponseFromFormArtifact } from '../../../server/utils/retrieveQuestionResponseFromFormArtifact'
import ReleaseDate from '../../../server/form-pages/apply/reasons-for-placement/basic-information/releaseDate'

export default class PlacementStartPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    const releaseDate = retrieveQuestionResponseFromFormArtifact(application, ReleaseDate) as string

    super(
      `Is ${DateFormats.isoDateToUIDate(releaseDate)} the date you want the placement to start?`,
      application,
      'basic-information',
      'placement-date',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('startDateSameAsReleaseDate')
  }
}
