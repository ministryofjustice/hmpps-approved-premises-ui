import { getStatusSpecificFields } from './allApPlacementsFields'
import { cas1SpaceBookingShortSummaryFactory } from '../../testutils/factories'

const getFieldLabels = (fields: ReturnType<typeof getStatusSpecificFields>) =>
  fields.filter(Boolean).map(f => (f.key as { text: string }).text)

describe('getStatusSpecificFields', () => {
  describe('upcoming status', () => {
    it('should return expected arrival and departure dates for upcoming placements', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.upcoming().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).toContain('Expected arrival date')
      expect(fieldLabels).toContain('Expected departure date')
      expect(fieldLabels).not.toContain('Actual arrival date')
      expect(fieldLabels).not.toContain('Departure date')
    })

    it('should include premises, booking date, requirements and delius number', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.upcoming().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).toContain('Approved Premises')
      expect(fieldLabels).toContain('Date of booking')
      expect(fieldLabels).toContain('Delius event number')
    })
  })

  describe('arrived status', () => {
    it('should return actual arrival date for arrived placements', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.current().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).toContain('Actual arrival date')
      expect(fieldLabels).toContain('Expected departure date')
      expect(fieldLabels).not.toContain('Expected arrival date')
    })

    it('should not include departure details for arrived placements', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.current().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).not.toContain('Departure date')
      expect(fieldLabels).not.toContain('Departure reason')
    })
  })

  describe('notArrived status', () => {
    it('should return expected dates and non-arrival details', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.nonArrival().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).toContain('Expected arrival date')
      expect(fieldLabels).toContain('Expected departure date')
      expect(fieldLabels).toContain('Non-arrival reason')
    })

    it('should not include actual arrival or departure dates', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.nonArrival().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).not.toContain('Actual arrival date')
      expect(fieldLabels).not.toContain('Departure date')
    })
  })

  describe('departed status', () => {
    it('should return actual arrival and departure dates with departure details', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.departed().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).toContain('Arrival date')
      expect(fieldLabels).toContain('Departure date')
      expect(fieldLabels).toContain('Departure reason')
      expect(fieldLabels).toContain('Notes')
    })

    it('should not include expected dates for departed placements', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.departed().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).not.toContain('Expected arrival date')
      expect(fieldLabels).not.toContain('Expected departure date')
    })
  })

  describe('cancelled status', () => {
    it('should return expected dates and cancellation details', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.cancelled().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).toContain('Expected arrival date')
      expect(fieldLabels).toContain('Expected departure date')
      expect(fieldLabels).toContain('Cancellation date')
    })

    it('should not include actual arrival or departure dates', () => {
      const placement = cas1SpaceBookingShortSummaryFactory.cancelled().build()
      const fields = getStatusSpecificFields(placement)
      const fieldLabels = getFieldLabels(fields)

      expect(fieldLabels).not.toContain('Actual arrival date')
      expect(fieldLabels).not.toContain('Departure date')
    })
  })

  describe('all statuses', () => {
    it('should always include premises, booking date, requirements and delius number', () => {
      const statuses = [
        cas1SpaceBookingShortSummaryFactory.upcoming().build(),
        cas1SpaceBookingShortSummaryFactory.current().build(),
        cas1SpaceBookingShortSummaryFactory.nonArrival().build(),
        cas1SpaceBookingShortSummaryFactory.departed().build(),
        cas1SpaceBookingShortSummaryFactory.cancelled().build(),
      ]

      statuses.forEach(placement => {
        const fields = getStatusSpecificFields(placement)
        const fieldLabels = getFieldLabels(fields)

        expect(fieldLabels).toContain('Approved Premises')
        expect(fieldLabels).toContain('Date of booking')
        expect(fieldLabels).toContain('Delius event number')
      })
    })
  })
})
