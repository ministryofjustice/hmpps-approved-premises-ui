import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class PlacementStartPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    const { releaseDate } = application.data['basic-information']['release-date']

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
