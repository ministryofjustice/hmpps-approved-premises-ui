import { add } from 'date-fns'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class PlacementDurationPage extends ApplyPage {
  application: ApprovedPremisesApplication

  constructor(application: ApprovedPremisesApplication) {
    super(
      'Placement duration and move on',
      application,
      'move-on',
      'placement-duration',
      paths.applications.show({ id: application.id }),
    )
    this.application = application
  }

  completeForm() {
    this.completeTextInputFromPageBody('duration')
    this.completeTextInputFromPageBody('durationDetail')

    this.expectedDepartureDateShouldBeCompleted(this.application.data['basic-information']['release-date'].releaseDate)
  }

  expectedDepartureDateShouldBeCompleted(releaseDate: string) {
    const departureDate = DateFormats.dateObjtoUIDate(add(DateFormats.isoToDateObj(releaseDate), { weeks: 10 }))
    cy.get('span[data-departure-date]').contains(departureDate)
  }
}
