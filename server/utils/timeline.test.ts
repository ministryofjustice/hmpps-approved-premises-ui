import { Cas1TimelineEventContentPayload } from '@approved-premises/api'
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
            type: 'booking_changed',
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              schemaVersion: undefined,
              arrivalOn: '2025-04-17',
              departureOn: '2025-06-21',
            } as Cas1TimelineEventContentPayload),
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).toEqual(
            `The placement at ${premises.name} had its arrival and/or departure date changed to Thu 17 Apr 2025 to Sat 21 Jun 2025.`,
          )
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
              schemaVersion: 2,
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

        it.each([
          ['the same', ['hasEnSuite']],
          ['both none', []],
        ])('does not render room criteria changes if they are %s', (_, characteristics) => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              schemaVersion: 2,
              characteristics,
              previousCharacteristics: characteristics,
            } as Cas1TimelineEventContentPayload),
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).not.toContain('Room criteria changed from')
        })

        it('renders "none" if previous or current criteria were none', () => {
          const timelineEvent = cas1TimelineEventFactory.build({
            payload: cas1TimelineEventContentPayloadFactory.build({
              type: 'booking_changed',
              premises: {
                name: premises.name,
                id: premises.id,
              },
              schemaVersion: 2,
              characteristics: ['hasEnSuite'],
              previousCharacteristics: [],
            } as Cas1TimelineEventContentPayload),
          })

          const result = renderTimelineEventContent(timelineEvent)

          expect(result).toContain('Room criteria changed from none to en-suite')
        })
      })
    })
  })
})
