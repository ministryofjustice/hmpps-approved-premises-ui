import { add } from 'date-fns'
import { Application } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import ApplyPage from './applyPage'

export default class PlacementDurationPage extends ApplyPage {
  application: Application

  constructor(application: Application) {
    super('Placement duration and move on', application, 'move-on', 'placement-duration')
    this.application = application
  }

  completeForm() {
    this.completeTextInputFromPageBody('duration')
    this.completeTextInputFromPageBody('durationDetail')

    this.expectedDepartureDateShouldBeCompleted(this.application.data['basic-information']['release-date'].releaseDate)
  }

  expectedDepartureDateShouldBeCompleted(releaseDate: string) {
    const departureDate = DateFormats.dateObjtoUIDate(add(DateFormats.convertIsoToDateObj(releaseDate), { weeks: 10 }))
    cy.get('span[data-departure-date]').contains(departureDate)
  }
}
