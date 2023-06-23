import { BedOccupancyRange, Premises } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class Calendar extends Page {
  constructor(premises: Premises) {
    super(premises.name)
  }

  shouldShowOccupancy(occupancyRange: Array<BedOccupancyRange>) {
    occupancyRange.forEach(occupancy => {
      cy.get(`tr[data-cy-bedId="${occupancy.bedId}"]`).within(() => {
        let columns = 0
        occupancy.schedule.forEach(item => {
          cy.get(`td[data-cy-startdate="${item.startDate}"]`)
            .should('have.attr', 'colspan')
            .and('contain', String(columns + item.length > 30 ? 31 - columns : item.length))
          columns += item.length
        })
      })
    })
  }

  shouldShowOverbookingsForPeriod(startDate: string, endDate: string) {
    cy.get(`td.govuk-table__cell--overbooking[data-cy-startdate="${startDate}"]`)
      .should('exist')
      .should('have.attr', 'colspan')
      .and(
        'contain',
        String(differenceInDays(DateFormats.isoToDateObj(endDate), DateFormats.isoToDateObj(startDate)) + 1),
      )
  }

  shouldShowOccupancyForId(id: string, startDate: Date, length: string) {
    cy.get(`td.govuk-table__cell[data-cy-id="${id}"][data-cy-startdate="${DateFormats.dateObjToIsoDate(startDate)}"]`)
      .should('exist')
      .should('have.attr', 'colspan')
      .and('contain', length)
  }
}
