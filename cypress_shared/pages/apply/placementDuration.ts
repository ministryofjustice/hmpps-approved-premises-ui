import { add } from 'date-fns'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../page'

export default class PlacementDurationPage extends Page {
  constructor() {
    super('Placement duration and move on')
  }

  completeForm() {
    this.getTextInputByIdAndEnterDetails('duration', '10')
    this.completeTextArea('durationDetail', 'Some more information')
  }

  expectedDepartureDateShouldBeCompleted(releaseDate: string) {
    const departureDate = DateFormats.dateObjtoUIDate(add(DateFormats.convertIsoToDateObj(releaseDate), { weeks: 10 }))
    cy.get('span[data-departure-date]').contains(departureDate)
  }
}
