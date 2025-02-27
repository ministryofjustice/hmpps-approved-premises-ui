import { Cas1SpaceCharacteristic, Cas1TimelineEvent, Cas1TimelineEventContentPayload } from '@approved-premises/api'
import nunjucks from 'nunjucks'
import path from 'path'
import { escape } from './formUtils'
import { linebreaksToParagraphs } from './utils'
import { DateFormats } from './dateUtils'
import { filterRoomLevelCriteria } from './match/spaceSearch'

import { roomCharacteristicsInlineList } from './characteristicsUtils'

type PayloadBookingChangedV1 = Cas1TimelineEventContentPayload & {
  schemaVersion: undefined
  arrivalOn: string
  departureOn: string
}

type PayloadBookingChangedV2 = Cas1TimelineEventContentPayload & {
  schemaVersion: 2
  expectedArrival: string
  expectedDeparture: string
  characteristics: Array<Cas1SpaceCharacteristic>
  previousExpectedArrival: string | null
  previousExpectedDeparture: string | null
  previousCharacteristics: Array<Cas1SpaceCharacteristic> | null
}

export const renderTimelineEventContent = (event: Cas1TimelineEvent): string => {
  if (event.payload) {
    if (event.payload.type === 'booking_changed') {
      if (event.payload.schemaVersion === 2) {
        nunjucks.configure(path.join(__dirname, '../views/partials/timelineEvents'))

        const {
          premises,
          expectedArrival,
          expectedDeparture,
          previousExpectedArrival,
          previousExpectedDeparture,
          characteristics,
          previousCharacteristics,
        } = event.payload as PayloadBookingChangedV2

        const isoDateToUiDateOrUndefined = (isoDate: string) =>
          isoDate ? DateFormats.isoDateToUIDate(isoDate) : undefined
        const roomCriteriaOrNone = (criteria: Array<Cas1SpaceCharacteristic>) =>
          roomCharacteristicsInlineList(filterRoomLevelCriteria(criteria || []), 'none')

        const context = {
          premises,
          expectedArrival: isoDateToUiDateOrUndefined(expectedArrival),
          expectedDeparture: isoDateToUiDateOrUndefined(expectedDeparture),
          previousExpectedArrival: isoDateToUiDateOrUndefined(previousExpectedArrival),
          previousExpectedDeparture: isoDateToUiDateOrUndefined(previousExpectedDeparture),
          characteristics: roomCriteriaOrNone(characteristics),
          previousCharacteristics: previousCharacteristics ? roomCriteriaOrNone(previousCharacteristics) : undefined,
        }

        return nunjucks.render('booking_changed.njk', context)
      }

      const {
        premises: { name: premisesName },
        arrivalOn,
        departureOn,
      } = event.payload as PayloadBookingChangedV1

      return `The placement at ${premisesName} had its arrival and/or departure date changed to ${DateFormats.isoDateToUIDate(arrivalOn)} to ${DateFormats.isoDateToUIDate(departureOn)}.`
    }
  }

  return event.content ? linebreaksToParagraphs(escape(event.content)) : undefined
}
