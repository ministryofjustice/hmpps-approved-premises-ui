import { Cas1BookingMadeContentPayload, Cas1TimelineEventContentPayload } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { cas1PremisesFactory, cas1TimelineEventFactory } from '../testutils/factories'
import { cas1TimelineEventContentPayloadFactory } from '../testutils/factories/cas1Timeline'
import { renderTimelineEventContent } from './timeline'

describe('timeline utilities', () => {
  describe('timeline event content renderer', () => {
    describe('when there is no payload', () => {
      it('renders nothing if there is no content', () => {
        const timelineEvent = cas1TimelineEventFactory.build({
          content: undefined,
          payload: undefined,
        })

        expect(renderTimelineEventContent(timelineEvent)).toEqual(undefined)
      })

      it('renders the content in a paragraph', () => {
        const timelineEvent = cas1TimelineEventFactory.build({
          payload: undefined,
          content: faker.lorem.sentences(),
        })

        expect(renderTimelineEventContent(timelineEvent)).toEqual(`<p class="govuk-body">${timelineEvent.content}</p>`)
      })

      it('escapes the content before rendering it', () => {
        const timelineEvent = cas1TimelineEventFactory.build({
          payload: undefined,
          content: '<script src="bad.js"/> & Nope',
        })

        expect(renderTimelineEventContent(timelineEvent)).toEqual(
          `<p class="govuk-body">&lt;script src=&quot;bad.js&quot;/&gt; &amp; Nope</p>`,
        )
      })
    })

    describe('when the event type is `booking_changed`', () => {
      const premises = cas1PremisesFactory.build()

      describe('if there is no schema version', () => {
        it('renders a basic description of changes', () => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              expectedArrival: '2025-09-18',
              expectedDeparture: '2025-12-18',
              schemaVersion: undefined,
              previousExpectedArrival: null,
              previousExpectedDeparture: null,
              characteristics: null,
              previousCharacteristics: null,
            } as Cas1TimelineEventContentPayload),
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).toMatchStringIgnoringWhitespace(`
            <p class="govuk-body">The placement at ${premises.name} had its arrival and/or departure dates changed to Thu 18 Sep 2025 to Thu 18 Dec 2025.</p>
          `)
        })
      })

      describe('if the schema version is 2', () => {
        it('renders the content with all changes', () => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              expectedArrival: '2025-09-18',
              expectedDeparture: '2025-12-18',
              previousExpectedArrival: '2025-09-16',
              previousExpectedDeparture: '2025-09-20',
              characteristics: [
                'acceptsNonSexualChildOffenders',
                'isCatered',
                'hasEnSuite',
                'isArsonSuitable',
                'isWheelchairDesignated',
              ],
              previousCharacteristics: ['acceptsNonSexualChildOffenders', 'isCatered', 'hasEnSuite'],
            } as Cas1TimelineEventContentPayload),
            schemaVersion: 2,
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).toMatchStringIgnoringWhitespace(`
            <p class="govuk-body">The placement at ${premises.name} has been changed:</p>
            <ul class="govuk-list govuk-list--bullet">
              <li>Arrival date changed from Tue 16 Sep 2025 to Thu 18 Sep 2025</li>
              <li>Departure date changed from Sat 20 Sep 2025 to Thu 18 Dec 2025</li>
              <li>Room criteria changed from en-suite to wheelchair accessible, en-suite and suitable for active arson risk</li>
            </ul>
          `)
        })

        it('does not render the detailed changes if there is no previous value', () => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              previousExpectedArrival: null,
              previousExpectedDeparture: null,
              previousCharacteristics: null,
              expectedArrival: '2025-09-18',
              expectedDeparture: '2025-12-18',
              characteristics: ['isCatered', 'hasEnSuite'],
            } as Cas1TimelineEventContentPayload),
            schemaVersion: 2,
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).not.toContain('Room criteria changed from')
          expect(result).not.toContain('Arrival date changed from')
          expect(result).not.toContain('Departure date changed from')
          expect(result).toContain('No change')
        })

        it('renders "none" if the previous room criteria were none', () => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              characteristics: ['hasEnSuite'],
              previousCharacteristics: [],
            } as Cas1TimelineEventContentPayload),
            schemaVersion: 2,
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).toContain('Room criteria changed from none to en-suite')
        })

        it('renders "none" if the updated room criteria are none', () => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              characteristics: [],
              previousCharacteristics: ['isWheelchairDesignated', 'isSingle'],
            } as Cas1TimelineEventContentPayload),
            schemaVersion: 2,
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).toContain('Room criteria changed from wheelchair accessible and single room to none')
        })
      })
    })

    describe('when the event type is `booking_made`', () => {
      const premises = cas1PremisesFactory.build()
      const payload: Cas1BookingMadeContentPayload = {
        type: 'booking_made',
        booking: {
          premises: {
            name: premises.name,
            id: premises.id,
          },
          arrivalDate: '2025-09-18',
          departureDate: '2025-12-18',
          bookingId: faker.string.uuid(),
        },
        eventNumber: '5',
      }

      it('Renders a standard placement creation event', () => {
        const timelineEvent = cas1TimelineEventFactory.build({ payload })

        const result = renderTimelineEventContent(timelineEvent)
        expect(result).toMatchStringIgnoringWhitespace(`
       <p class="govuk-body">A placement at ${payload.booking.premises.name} was booked for Thu 18 Sep 2025 to Thu 18 Dec 2025 
       against Delius Event Number 5.</p>`)
      })

      it('Renders a transfer placement creation event with additional fields', () => {
        const timelineEvent = cas1TimelineEventFactory.build({
          payload: {
            ...payload,
            booking: {
              ...payload.booking,
              transferReason: 'placement_prioritisation',
              additionalInformation: 'Some information',
            },
          },
        })

        const result = renderTimelineEventContent(timelineEvent)
        expect(result).toMatchStringIgnoringWhitespace(`
<p class="govuk-body">A placement at ${payload.booking.premises.name} was booked for Thu 18 Sep 2025 to Thu 18 Dec 2025 against Delius Event Number 5.</p>
<dl><dt>Reason for transfer:</dt><dd>Placement prioritisation</dd></dl>
<dl><dt>Additional information:</dt><dd>Some information</dd></dl>`)
      })
    })
  })
})
