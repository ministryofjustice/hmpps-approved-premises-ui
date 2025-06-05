import {
  Cas1BookingChangedContentPayload,
  Cas1PlacementChangeRequestCreatedPayload,
  Cas1SpaceCharacteristic,
  Cas1TimelineEvent,
} from '@approved-premises/api'
import nunjucks from 'nunjucks'
import path from 'path'
import { ChangeRequestReason } from '@approved-premises/ui'
import { escape } from './formUtils'
import { linebreaksToParagraphs } from './utils'
import { DateFormats } from './dateUtils'
import { filterRoomLevelCriteria } from './match/spaceSearch'

import { roomCharacteristicsInlineList } from './characteristicsUtils'
import { getChangeRequestReasonText } from './placements/changeRequests'

const isoDateToUiDateOrUndefined = (isoDate: string) => (isoDate ? DateFormats.isoDateToUIDate(isoDate) : undefined)
const templatePath = path.join(__dirname, '../views/partials/timelineEvents')

export const renderTimelineEventContent = (event: Cas1TimelineEvent): string => {
  if (event.payload) {
    const eventType = event.payload.type
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

    if (eventType === 'placement_change_request_created') {
      const {
        changeRequestId,
        changeRequestType,
        reason: { name: reasonName },
        booking: {
          premises: { name: premisesName },
          arrivalDate,
          departureDate,
        },
      } = event.payload as Cas1PlacementChangeRequestCreatedPayload

      return nunjucks.render(`${templatePath}/change_request_created.njk`, {
        changeRequestId,
        changeRequestType,
        premisesName,
        eventType,
        expectedArrival: isoDateToUiDateOrUndefined(arrivalDate),
        expectedDeparture: isoDateToUiDateOrUndefined(departureDate),
        reasonText: getChangeRequestReasonText(reasonName as ChangeRequestReason),
      })
    }
  }

  return event.content ? linebreaksToParagraphs(escape(event.content)) : undefined
}
