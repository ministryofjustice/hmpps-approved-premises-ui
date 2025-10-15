import { cas1SpaceBookingFactory, cas1SpaceBookingSummaryFactory } from '../../testutils/factories'
import { detailedStatus, overallStatus } from './status'

describe('placement status utilities', () => {
  describe.each([
    ['placement summary', cas1SpaceBookingSummaryFactory],
    ['full placement', cas1SpaceBookingFactory],
  ])('when passed a %s', (_, typeFactory) => {
    const upcoming = typeFactory.upcoming()
    const current = typeFactory.current()
    const departed = typeFactory.departed()
    const nonArrival = typeFactory.nonArrival()
    const cancelled = typeFactory.cancelled()

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-03-01'))
    })

    const testCases = [
      {
        label: 'an upcoming placement',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-05-01' },
        expected: { overall: 'upcoming', detailed: 'upcoming' },
      },
      {
        label: 'an upcoming placement starting within 6 weeks',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-04-11' },
        expected: { overall: 'upcoming', detailed: 'arrivingWithin6Weeks' },
      },
      {
        label: 'an upcoming placement starting within 2 weeks',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-03-14' },
        expected: { overall: 'upcoming', detailed: 'arrivingWithin2Weeks' },
      },
      {
        label: 'an upcoming placement starting today',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-03-01' },
        expected: { overall: 'upcoming', detailed: 'arrivingToday' },
      },
      {
        label: 'an upcoming placement overdue arrival',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-02-28' },
        expected: { overall: 'upcoming', detailed: 'overdueArrival' },
      },
      {
        label: 'a current placement departing in more than 6 weeks',
        factory: current,
        params: { expectedDepartureDate: '2025-05-01' },
        expected: { overall: 'arrived', detailed: 'arrived' },
      },
      {
        label: 'a current placement departing within 2 weeks',
        factory: current,
        params: { expectedDepartureDate: '2025-03-14' },
        expected: { overall: 'arrived', detailed: 'departingWithin2Weeks' },
      },
      {
        label: 'a current placement departing today',
        factory: current,
        params: { expectedDepartureDate: '2025-03-01' },
        expected: { overall: 'arrived', detailed: 'departingToday' },
      },
      {
        label: 'a current placement overdue departure',
        factory: current,
        params: { expectedDepartureDate: '2025-02-28' },
        expected: { overall: 'arrived', detailed: 'overdueDeparture' },
      },
      {
        label: 'a departed placement',
        factory: departed,
        params: {},
        expected: { overall: 'departed', detailed: 'departed' },
      },
      {
        label: 'a non-arrived placement',
        factory: nonArrival,
        params: {},
        expected: { overall: 'notArrived', detailed: 'notArrived' },
      },
      {
        label: 'a cancelled placement',
        factory: cancelled,
        params: { expectedArrivalDate: '2025-05-01' },
        expected: { overall: 'cancelled', detailed: 'cancelled' },
      },
    ]

    it.each(testCases)('should return a status for $label', ({ factory, params, expected }) => {
      const placement = factory.build(params)

      expect(overallStatus(placement)).toEqual(expected.overall)
      expect(detailedStatus(placement)).toEqual(expected.detailed)
    })
  })
})
