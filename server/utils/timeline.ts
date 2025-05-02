import { Cas1BookingChangedContentPayload, Cas1SpaceCharacteristic, Cas1TimelineEvent } from '@approved-premises/api'
import nunjucks from 'nunjucks'
import path from 'path'
import { escape } from './formUtils'
import { linebreaksToParagraphs } from './utils'
import { DateFormats } from './dateUtils'
import { filterRoomLevelCriteria } from './match/spaceSearch'

import { roomCharacteristicsInlineList } from './characteristicsUtils'

export const renderTimelineEventContent = (event: Cas1TimelineEvent): string => {
  if (event.payload) {
    if (event.payload.type === 'booking_changed') {
      const {
        premises,
        expectedArrival,
        expectedDeparture,
        previousExpectedArrival,
        previousExpectedDeparture,
        characteristics,
        previousCharacteristics,
      } = event.payload as Cas1BookingChangedContentPayload

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

      nunjucks.configure(path.join(__dirname, '../views/partials/timelineEvents'))

      if (event.schemaVersion === 2) {
        return nunjucks.render('booking_changed_v2.njk', context)
      }
      return nunjucks.render('booking_changed.njk', context)
    }
  }

  return event.content ? linebreaksToParagraphs(escape(event.content)) : undefined
}
