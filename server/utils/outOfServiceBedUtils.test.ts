import { outOfServiceBedFactory, outOfServiceBedRevisionFactory, userDetailsFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  actionCell,
  allOutOfServiceBedsTableHeaders,
  allOutOfServiceBedsTableRows,
  bedRevisionDetails,
  generateConflictBespokeError,
  outOfServiceBedActions,
  outOfServiceBedTableHeaders,
  outOfServiceBedTableRows,
  overwriteOoSBedWithUserInput,
  referenceNumberCell,
  sortOutOfServiceBedRevisionsByUpdatedAt,
} from './outOfServiceBedUtils'
import { Cas1OutOfServiceBedSortField as OutOfServiceBedSortField } from '../@types/shared'
import { sortHeader } from './sortHeader'
import paths from '../paths/manage'
import { SanitisedError } from '../sanitisedError'

describe('outOfServiceBedUtils', () => {
  describe('allOutOfServiceBedsTableHeaders', () => {
    it('returns the table headers', () => {
      const sortBy = 'bedName'
      const sortDirection = 'asc'
      const hrefPrefix = 'http://example.com'

      expect(allOutOfServiceBedsTableHeaders(sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<OutOfServiceBedSortField>('Premises', 'premisesName', sortBy, sortDirection, hrefPrefix),
        sortHeader<OutOfServiceBedSortField>('Room', 'roomName', sortBy, sortDirection, hrefPrefix),
        sortHeader<OutOfServiceBedSortField>('Bed', 'bedName', sortBy, sortDirection, hrefPrefix),
        sortHeader<OutOfServiceBedSortField>('Start date', 'startDate', sortBy, sortDirection, hrefPrefix),
        sortHeader<OutOfServiceBedSortField>('End date', 'endDate', sortBy, sortDirection, hrefPrefix),
        sortHeader<OutOfServiceBedSortField>('Reason', 'reason', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Ref number',
        },
        sortHeader<OutOfServiceBedSortField>('Days lost', 'daysLost', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Actions',
        },
      ])
    })
  })

  describe('allOutOfServiceBedsTableRows', () => {
    const outOfServiceBed = outOfServiceBedFactory.build()

    it('returns table rows', () => {
      const expectedRows = [
        [
          { text: outOfServiceBed.premises.name },
          { text: outOfServiceBed.room.name },
          { text: outOfServiceBed.bed.name },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.startDate, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.endDate, { format: 'short' }) },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
          { text: outOfServiceBed.daysLostCount.toString() },
          actionCell(outOfServiceBed, outOfServiceBed.premises.id),
        ],
      ]
      const rows = allOutOfServiceBedsTableRows([outOfServiceBed])
      expect(rows).toEqual(expectedRows)
    })
  })

  describe('referenceNumberCell', () => {
    it('returns ref number', () => {
      const refNumber = '123'
      expect(referenceNumberCell(refNumber)).toEqual({ text: refNumber })
    })
    it('returns text if no ref number', () => {
      expect(referenceNumberCell(undefined)).toEqual({ text: 'Not provided' })
    })
  })

  describe('outOfServiceBedTableHeaders', () => {
    it('returns all table headers', () => {
      expect(outOfServiceBedTableHeaders()).toEqual([
        { text: 'Bed' },
        { text: 'Room' },
        { text: 'Start date' },
        { text: 'End date' },
        { text: 'Reason' },
        { text: 'Ref number' },
        { text: 'Details' },
      ])
    })
  })

  describe('outOfServiceBedTableRows', () => {
    const outOfServiceBed = outOfServiceBedFactory.build({ referenceNumber: '123' })
    const premisesId = 'premisesId'

    it('returns table rows', () => {
      const expectedRows = [
        [
          { text: outOfServiceBed.bed.name },
          { text: outOfServiceBed.room.name },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.startDate, { format: 'short' }) },
          { text: DateFormats.isoDateToUIDate(outOfServiceBed.endDate, { format: 'short' }) },
          { text: outOfServiceBed.reason.name },
          { text: outOfServiceBed.referenceNumber || 'Not provided' },
          actionCell(outOfServiceBed, premisesId),
        ],
      ]
      const rows = outOfServiceBedTableRows([outOfServiceBed], premisesId)

      expect(rows).toEqual(expectedRows)
    })
  })

  describe('outOfServiceBedActions', () => {
    const premisesId = 'premisesId'
    const bedId = 'bedId'
    const id = 'oosbId'

    it('should return null if the user does not have any permissions', () => {
      const user = userDetailsFactory.build({ permissions: [] })

      expect(outOfServiceBedActions(user, premisesId, bedId, id)).toEqual(null)
    })

    it('should return an action to update the OOSB if the user has the create OOSB permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_out_of_service_bed_create'] })

      expect(outOfServiceBedActions(user, premisesId, bedId, id)).toEqual([
        {
          items: [
            {
              text: 'Update out of service bed',
              href: paths.outOfServiceBeds.update({ premisesId, id, bedId }),
            },
          ],
        },
      ])
    })

    it('should return an action to cancel the OOSB if the user has the cancel OOSB permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_out_of_service_bed_cancel'] })

      expect(outOfServiceBedActions(user, premisesId, bedId, id)).toEqual([
        {
          items: [
            {
              text: 'Cancel out of service bed',
              href: paths.outOfServiceBeds.cancel({ premisesId, id, bedId }),
            },
          ],
        },
      ])
    })
  })

  describe('bedRevisionDetails', () => {
    it('adds a formatted start date the summary list', () => {
      const startDate = new Date(2024, 2, 1)
      const revision = outOfServiceBedRevisionFactory.build({
        startDate: DateFormats.dateObjToIsoDate(startDate),
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([
          { key: { text: 'Start date' }, value: { text: DateFormats.dateObjtoUIDate(startDate) } },
        ]),
      )
    })

    it('adds a formatted end date the summary list', () => {
      const endDate = new Date(2024, 2, 1)
      const revision = outOfServiceBedRevisionFactory.build({
        endDate: DateFormats.dateObjToIsoDate(endDate),
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'End date' }, value: { text: DateFormats.dateObjtoUIDate(endDate) } }]),
      )
    })

    it('adds a reason the summary list', () => {
      const revision = outOfServiceBedRevisionFactory.build({
        reason: { id: 'reasonId', name: 'reasonName' },
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'Reason' }, value: { text: revision.reason.name } }]),
      )
    })

    it('adds a reference the summary list', () => {
      const revision = outOfServiceBedRevisionFactory.build({
        referenceNumber: '123',
      })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'Reference number' }, value: { text: revision.referenceNumber } }]),
      )
    })

    it('adds a notes item to the summary list', () => {
      const revision = outOfServiceBedRevisionFactory.build({ notes: 'some note' })

      expect(bedRevisionDetails(revision)).toEqual(
        expect.arrayContaining([{ key: { text: 'Notes' }, value: { text: 'some note' } }]),
      )
    })
  })

  describe('sortOutOfServiceBedRevisionsByUpdatedAt', () => {
    it('sorts revisions by updatedAt in descending order', () => {
      const earliestDate = outOfServiceBedRevisionFactory.build({ updatedAt: '2024-01-01T00:00:00Z' })
      const middleDate = outOfServiceBedRevisionFactory.build({ updatedAt: '2024-01-02T00:00:00Z' })
      const latestDate = outOfServiceBedRevisionFactory.build({ updatedAt: '2024-01-03T00:00:00Z' })

      const unsortedRevisions = [earliestDate, latestDate, middleDate]

      const sortedRevisions = sortOutOfServiceBedRevisionsByUpdatedAt(unsortedRevisions)

      expect(sortedRevisions).toEqual([latestDate, middleDate, earliestDate])
    })
  })

  describe('overwriteOoSBedWithUserInput', () => {
    it('overwrites the reason ID if there is a reason in the userInput', () => {
      const userInput = { outOfServiceBed: { reason: 'new reason' } }
      const outOfServiceBed = outOfServiceBedFactory.build()

      expect(overwriteOoSBedWithUserInput(userInput, outOfServiceBed)).toEqual(
        expect.objectContaining({
          reason: expect.objectContaining({ id: 'new reason' }),
        }),
      )
    })

    it('overwrites the reference number if there is a reason in the userInput', () => {
      const userInput = { outOfServiceBed: { referenceNumber: 'new reason' } }
      const outOfServiceBed = outOfServiceBedFactory.build()

      expect(overwriteOoSBedWithUserInput(userInput, outOfServiceBed)).toEqual(
        expect.objectContaining({ referenceNumber: 'new reason' }),
      )
    })
  })

  describe('generateConflictBespokeError', () => {
    const premisesId = 'premises-id'
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
})
