import { faker } from '@faker-js/faker'
import { subDays } from 'date-fns'
import { outOfServiceBedFactory, outOfServiceBedRevisionFactory, userDetailsFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import {
  actionCell,
  allOutOfServiceBedsTableHeaders,
  allOutOfServiceBedsTableRows,
  CreateOutOfServiceBedBody,
  generateConflictBespokeError,
  outOfServiceBedActions,
  outOfServiceBedSummaryList,
  outOfServiceBedTableHeaders,
  outOfServiceBedTableRows,
  referenceNumberCell,
  sortOutOfServiceBedRevisionsByUpdatedAt,
  validateOutOfServiceBedInput,
} from './outOfServiceBedUtils'
import { Cas1OutOfServiceBedReason, Cas1OutOfServiceBedSortField as OutOfServiceBedSortField } from '../@types/shared'
import { sortHeader } from './sortHeader'
import paths from '../paths/manage'
import { SanitisedError } from '../sanitisedError'
import outOfServiceBedReasonsJson from '../testutils/referenceData/stubs/cas1/out-of-service-bed-reasons.json'
import { ValidationError } from './errors'

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
          text: 'Reference/CRN',
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
        { text: 'Reference/CRN' },
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

  describe('outOfServiceBedSummaryList', () => {
    const startDate = DateFormats.dateObjToIsoDate(faker.date.soon({ days: 80 }))
    const endDate = DateFormats.dateObjToIsoDate(faker.date.soon({ refDate: startDate, days: 80 }))
    const outOfServiceBed = outOfServiceBedFactory.build({
      startDate,
      endDate,
      referenceNumber: '123',
      notes: `some notes\ntwo lines`,
    })

    const expectedRows = [
      { key: { text: 'Start date' }, value: { text: DateFormats.isoDateToUIDate(startDate) } },
      { key: { text: 'End date' }, value: { text: DateFormats.isoDateToUIDate(endDate) } },
      { key: { text: 'Reason' }, value: { text: outOfServiceBed.reason.name } },
      { key: { text: 'Reference/CRN' }, value: { text: '123' } },
      {
        key: { text: 'Additional information' },
        value: { html: `<span class="govuk-summary-list__textblock">some notes\ntwo lines</span>` },
      },
    ]

    it('renders a summary list with the OOSB details', () => {
      expect(outOfServiceBedSummaryList(outOfServiceBed)).toEqual({
        rows: expectedRows,
      })
    })

    it('renders blank rows where data are not supplied', () => {
      const expectedRowCopy = [...expectedRows]
      expectedRowCopy.splice(0, 1, { key: { text: 'Start date' }, value: { text: '' } })
      expect(outOfServiceBedSummaryList({ ...outOfServiceBed, startDate: undefined })).toEqual({
        rows: expectedRowCopy,
      })
    })

    it('omits blank rows where data are not supplied when supressBlank is set', () => {
      expect(outOfServiceBedSummaryList({ ...outOfServiceBed, startDate: undefined }, true)).toEqual({
        rows: expectedRows.slice(1),
      })
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

  describe('validateOutOfServiceBedInput', () => {
    const startDate = faker.date.recent({ days: 7 })
    const endDate = faker.date.soon({ refDate: startDate, days: 21 })

    const validBody: CreateOutOfServiceBedBody = {
      ...DateFormats.dateObjectToDateInputs(startDate, 'startDate'),
      ...DateFormats.dateObjectToDateInputs(endDate, 'endDate'),
      reason: outOfServiceBedReasonsJson.find(reason => reason.referenceType === 'workOrder').id,
      referenceNumber: '',
      notes: 'Some notes',
    }
    const oosbReasons = outOfServiceBedReasonsJson as Array<Cas1OutOfServiceBedReason>
    const user = userDetailsFactory.build()

    const expectErrors = (userInput: CreateOutOfServiceBedBody, expectedErrors: Record<string, string>) => {
      let error

      try {
        validateOutOfServiceBedInput(userInput, user, oosbReasons)
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(ValidationError)
      expect(error.data).toEqual(expectedErrors)
    }

    it('throws if the dates are empty', () => {
      const bodyEmptyDates = {
        ...validBody,
        'startDate-year': '',
        'endDate-year': '',
        'endDate-month': '',
        'endDate-day': '',
      }
      expectErrors(bodyEmptyDates, {
        startDate: 'You must enter a start date',
        endDate: 'You must enter an end date',
      })
    })

    it('returns errors if the dates are invalid', async () => {
      const bodyInvalidDates = {
        ...validBody,
        'startDate-day': '45',
        'endDate-year': 'nope',
      }
      expectErrors(bodyInvalidDates, {
        startDate: 'You must enter a valid start date',
        endDate: 'You must enter a valid end date',
      })
    })

    describe('date range check', () => {
      const badStartDate = faker.date.recent({ refDate: subDays(new Date(), 8), days: 7 })
      const badEndDate = faker.date.soon({ refDate: badStartDate, days: 21 })

      const badBody: CreateOutOfServiceBedBody = {
        ...validBody,
        ...DateFormats.dateObjectToDateInputs(badStartDate, 'startDate'),
        ...DateFormats.dateObjectToDateInputs(badEndDate, 'endDate'),
      }

      it('returns errors if start date is more than 1 week ago', async () => {
        expectErrors(badBody, {
          startDate: 'You must enter a start date no earlier than 7 days ago',
        })
      })

      it('supresses the date range check if user has override permission', () => {
        expect(
          validateOutOfServiceBedInput(
            badBody,
            { ...user, permissions: ['cas1_out_of_service_bed_no_date_limit'] },
            oosbReasons,
          ),
        ).toEqual(expect.objectContaining({ startDate: DateFormats.dateObjToIsoDate(badStartDate) }))
      })
    })

    it('returns an error if the end date is before the start date', async () => {
      const bodyEndBeforeStart = {
        ...validBody,
        'startDate-year': '2026',
        'startDate-month': '10',
        'startDate-day': '15',
        'endDate-year': '2026',
        'endDate-month': '10',
        'endDate-day': '14',
      }
      expectErrors(bodyEndBeforeStart, {
        endDate: 'The end date must be on or after the start date',
      })
    })

    describe('when the reason selected is linked to a person and needs a CRN to be entered', () => {
      const bodyCrn = { ...validBody }
      beforeEach(() => {
        bodyCrn.reason = outOfServiceBedReasonsJson.find(reason => reason.referenceType === 'crn').id
      })

      it('returns an error if the Work order reference number/CRN field is empty', async () => {
        const bodyNoCrn = { ...bodyCrn, referenceNumber: '' }

        expectErrors(bodyNoCrn, {
          referenceNumber: 'You must enter a CRN',
        })
      })

      it('returns an error if the Work order reference number/CRN field is an invalid CRN', async () => {
        const bodyInvalidCrn = { ...bodyCrn, referenceNumber: 'not a crn' }

        expectErrors(bodyInvalidCrn, {
          referenceNumber: 'You must enter a valid CRN',
        })
      })
    })
  })
})
