import { SanitisedError } from '../../sanitisedError'
import { cancellationReasonsRadioItems, generateConflictBespokeError } from '.'
import paths from '../../paths/manage'

describe('bookingUtils', () => {
  const premisesId = 'e8f29a4a-dd4d-40a2-aa58-f3f60245c8fc'

  beforeEach(() => {
    jest.resetModules()
  })

  describe('generateConflictBespokeError', () => {
    const bookingId = 'booking-id'
    const bedId = 'bed-id'
    const lostBedId = 'lost-bed-id'

    it('generates a bespoke error when there is a conflicting booking', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'plural', bedId)).toEqual({
        errorTitle: 'This bedspace is not available for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.premises.placements.show({
              premisesId,
              placementId: bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error when there is a conflicting out-of-service bed', () => {
      const err = {
        data: {
          detail: `An out-of-service bed already exists for dates from 2024-10-05 to 2024-10-20 which overlaps with the desired dates: ${lostBedId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'plural', bedId)).toEqual({
        errorTitle: 'Out of service bed record cannot be created for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.outOfServiceBeds.show({
              premisesId,
              bedId,
              id: lostBedId,
              tab: 'details',
            })}">existing out of service beds record</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error for a single date', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, 'singular', bedId)).toEqual({
        errorTitle: 'This bedspace is not available for the date entered',
        errorSummary: [
          {
            html: `It conflicts with an <a href="${paths.premises.placements.show({
              premisesId,
              placementId: bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })
  })

  describe('cancellationReasonRadioItems', () => {
    const objects = [
      {
        id: '123',
        name: 'Other',
      },
      {
        id: '345',
        name: 'foo',
      },
    ]

    it('converts objects to an array of radio items', () => {
      const result = cancellationReasonsRadioItems(objects, 'somehtml', {})

      expect(result).toEqual([
        {
          text: 'Other',
          value: '123',
          checked: false,
          conditional: {
            html: 'somehtml',
          },
        },
        {
          text: 'foo',
          value: '345',
          checked: false,
        },
      ])
    })
  })
})
