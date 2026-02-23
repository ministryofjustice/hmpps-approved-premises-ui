import {
  Cas1ApplicationExpiredManuallyPayload,
  Cas1BookingChangedContentPayload,
  Cas1BookingMadeContentPayload,
  Cas1SpaceCharacteristic,
  Cas1TimelineEvent,
} from '@approved-premises/api'
import nunjucks from 'nunjucks'
import path from 'path'
import { escape } from './formUtils'
import { linebreaksToParagraphs } from './utils'
import { DateFormats } from './dateUtils'
import { filterRoomLevelCriteria } from './match/spaceSearch'

import { roomCharacteristicsInlineList } from './characteristicsUtils'
import { newPlacementReasons } from './match'

const isoDateToUiDateOrUndefined = (isoDate: string) => (isoDate ? DateFormats.isoDateToUIDate(isoDate) : undefined)
const templatePath = path.join(__dirname, '../views/partials/timelineEvents')

export const renderTimelineEventContent = (event: Cas1TimelineEvent): string => {
  if (event.payload) {
    const eventType = event.payload.type
    if (eventType === 'booking_made') {
      const {
        booking: { arrivalDate, departureDate, transferReason, additionalInformation, premises },
        eventNumber,
      } = event.payload as Cas1BookingMadeContentPayload

      const context = {
        premises,
        expectedArrival: isoDateToUiDateOrUndefined(arrivalDate),
        expectedDeparture: isoDateToUiDateOrUndefined(departureDate),
        eventNumber,
        transferReason: newPlacementReasons[transferReason],
        additionalInformation,
      }
      return nunjucks.render(`${templatePath}/booking_made.njk`, context)
    }

    if (eventType === 'booking_changed') {
      const {
        premises,
        expectedArrival,
        expectedDeparture,
        previousExpectedArrival,
        previousExpectedDeparture,
        characteristics,
        previousCharacteristics,
      } = event.payload as Cas1BookingChangedContentPayload

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

      if (event.schemaVersion === 2) {
        return nunjucks.render(`${templatePath}/booking_changed_v2.njk`, context)
      }
      return nunjucks.render(`${templatePath}/booking_changed.njk`, context)
    }

    if (eventType === 'application_manually_expired') {
      const { expiredReason } = event.payload as Cas1ApplicationExpiredManuallyPayload

      const context = { expiredReason }
      return nunjucks.render(`${templatePath}/application_expired.njk`, context)
    }
  }

  return event.content ? linebreaksToParagraphs(escape(event.content)) : undefined
}
