import { bookingFactory, withdrawableFactory } from '../../../testutils/factories'
import { placementApplicationWithdrawalReasons, withdrawableRadioOptions, withdrawableTypeRadioOptions } from '.'
import { DateFormats } from '../../dateUtils'
import { linkTo } from '../../utils'
import matchPaths from '../../../paths/match'
import managePaths from '../../../paths/manage'

describe('withdrawableTypeRadioOptions', () => {
  const applicationRadioItem = {
    text: 'Application',
    value: 'application',
    checked: false,
    hint: {
      text: 'This will withdraw the application, assessment, and any related placement requests and bookings.',
    },
  }

  const placementRequestRadioItem = {
    checked: false,
    text: 'Placement request',
    value: 'placementRequest',
    hint: {
      text: 'This will withdraw a placement request and any related bookings.',
    },
  }

  const bookingRadioItem = {
    checked: false,
    text: 'Booking',
    value: 'booking',
    hint: {
      text: 'This will withdraw a booking but retain the placement request so that the person can be matched somewhere else.',
    },
  }

  it('should return the application radio item if passed an empty array', () => {
    expect(withdrawableTypeRadioOptions([])).toEqual([applicationRadioItem])
  })

  it('should return the placementRequest item if passed a placement request Withdrawable', () => {
    const paWithdrawable = withdrawableFactory.buildList(1, { type: 'placement_application' })
    expect(withdrawableTypeRadioOptions(paWithdrawable)).toEqual([applicationRadioItem, placementRequestRadioItem])

    const prWithdrawable = withdrawableFactory.buildList(1, { type: 'placement_request' })
    expect(withdrawableTypeRadioOptions(prWithdrawable)).toEqual([applicationRadioItem, placementRequestRadioItem])
  })

  it('should return the booking item if passed a booking Withdrawable', () => {
    const withdrawable = withdrawableFactory.buildList(1, { type: 'booking' })
    expect(withdrawableTypeRadioOptions(withdrawable)).toEqual([applicationRadioItem, bookingRadioItem])
  })

  it('should return the booking item if passed a booking Withdrawable', () => {
    const bookingWithdrawable = withdrawableFactory.build({ type: 'booking' })
    const paWithdrawable = withdrawableFactory.build({ type: 'placement_request' })
    expect(withdrawableTypeRadioOptions([bookingWithdrawable, paWithdrawable])).toEqual([
      applicationRadioItem,
      bookingRadioItem,
      placementRequestRadioItem,
    ])
  })

  it('returns checked: true if an item is selected', () => {
    const withdrawable = withdrawableFactory.buildList(1, { type: 'booking' })
    expect(withdrawableTypeRadioOptions(withdrawable, 'booking')).toEqual([
      applicationRadioItem,
      { ...bookingRadioItem, checked: true },
    ])
  })

  describe('withdrawableRadioOptions', () => {
    it('returns the withdrawables in radio input format', () => {
      const paWithdrawable = withdrawableFactory.build({ type: 'placement_application' })
      const prWithdrawable = withdrawableFactory.build({ type: 'placement_request' })
      const booking = bookingFactory.build()
      const bookingWithdrawable = withdrawableFactory.build({ type: 'booking', id: booking.id })

      expect(
        withdrawableRadioOptions([paWithdrawable, prWithdrawable, bookingWithdrawable], paWithdrawable.id, [booking]),
      ).toEqual([
        {
          text: paWithdrawable.dates
            .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
            .join(', '),
          checked: true,
          value: paWithdrawable.id,
        },
        {
          text: prWithdrawable.dates
            .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
            .join(', '),
          checked: false,
          hint: {
            html: linkTo(
              matchPaths.placementRequests.show,
              { id: prWithdrawable.id },
              {
                text: 'See placement details (opens in a new tab)',
                attributes: { 'data-cy-withdrawable-id': prWithdrawable.id },
              },
            ),
          },
          value: prWithdrawable.id,
        },
        {
          checked: false,
          hint: {
            html: linkTo(
              managePaths.bookings.show,
              { bookingId: booking.id, premisesId: booking.premises.id },
              {
                text: 'See booking details (opens in a new tab)',
                attributes: { 'data-cy-withdrawable-id': booking.id },
              },
            ),
          },
          text: `${booking.premises.name} - ${bookingWithdrawable.dates
            .map(datePeriod => DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate))
            .join(', ')}`,
          value: bookingWithdrawable.id,
        },
      ])
    })
  })

  describe('placementApplicationWithdrawalReasons', () => {
    it('returns the reasons for withdrawing a placement application', () => {
      expect(placementApplicationWithdrawalReasons('DuplicatePlacementRequest')).toEqual([
        { divider: 'Problem in placement request' },
        { text: 'Duplicate placement request', value: 'DuplicatePlacementRequest', checked: true },
        { divider: 'Placement no longer required' },
        {
          text: 'Alternative provision identified',
          value: 'AlternativeProvisionIdentified',
          checked: false,
        },
      ])
    })
  })
})
