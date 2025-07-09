import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1PremisesDaySummary } from '@approved-premises/api'
import { addDays } from 'date-fns'
import { DateFormats } from '../../utils/dateUtils'
import { cas1PremiseCapacityForDayFactory } from './cas1PremiseCapacity'
import cas1OutOfServiceBedSummaryFactory from './cas1OutOfServiceBedSummary'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'

export default Factory.define<Cas1PremisesDaySummary>(({ params }) => {
  const forDate = params.forDate ? DateFormats.isoToDateObj(params.forDate) : faker.date.anytime()
  const capacity = cas1PremiseCapacityForDayFactory.build({
    date: DateFormats.dateObjToIsoDate(forDate),
  })
  return {
    forDate: DateFormats.dateObjToIsoDate(forDate),
    previousDate: DateFormats.dateObjToIsoDate(addDays(forDate, -1)),
    nextDate: DateFormats.dateObjToIsoDate(addDays(forDate, 1)),
    capacity,
    spaceBookings: [],
    spaceBookingSummaries: cas1SpaceBookingSummaryFactory.buildList(5),
    outOfServiceBeds: cas1OutOfServiceBedSummaryFactory.buildList(4),
  } as Cas1PremisesDaySummary
})
