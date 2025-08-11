import { cas1SpaceBookingFactory, withdrawableFactory } from '../../../testutils/factories'
import { hintCopy, withdrawableRadioOptions, withdrawableTypeRadioOptions } from '.'
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
      html: hintCopy.application,
    },
  }

  const placementRequestRadioItem = {
    checked: false,
    text: 'Request for placement',
    value: 'placementRequest',
    hint: {
      html: hintCopy.placementRequest,
    },
  }

  const placementRadioItem = {
    checked: false,
    text: 'Placement',
    value: 'placement',
    hint: {
      html: hintCopy.placement,
    },
  }

  it('should return the application radio item if passed an application withdrawable', () => {
    const applicationWithdrawable = withdrawableFactory.buildList(1, { type: 'application' })

    expect(withdrawableTypeRadioOptions(applicationWithdrawable)).toEqual([applicationRadioItem])
  })

  it('should return the placementRequest item if passed a placement request Withdrawable', () => {
    const paWithdrawable = withdrawableFactory.buildList(1, { type: 'placement_application' })
    expect(withdrawableTypeRadioOptions(paWithdrawable)).toEqual([placementRequestRadioItem])

    const prWithdrawable = withdrawableFactory.buildList(1, { type: 'placement_request' })
    expect(withdrawableTypeRadioOptions(prWithdrawable)).toEqual([placementRequestRadioItem])
  })

  it('should return the booking item if passed a space_booking Withdrawable', () => {
    const placementWithdrawable = withdrawableFactory.build({ type: 'space_booking' })

    expect(withdrawableTypeRadioOptions([placementWithdrawable])).toEqual([placementRadioItem])
  })

  it('returns checked: true if an item is selected', () => {
    const withdrawable = withdrawableFactory.buildList(1, { type: 'space_booking' })
    expect(withdrawableTypeRadioOptions(withdrawable, 'placement')).toEqual([{ ...placementRadioItem, checked: true }])
  })

  describe('withdrawableRadioOptions', () => {
    const paWithdrawable = withdrawableFactory.build({ type: 'placement_application' })
    const prWithdrawable = withdrawableFactory.build({ type: 'placement_request' })

    const applicationAndAssesRadios = [
      {
        text: paWithdrawable.dates
          .map(datePeriod =>
            DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate, { format: 'short' }),
          )
          .join(', '),
        checked: true,
        value: paWithdrawable.id,
      },
      {
        text: prWithdrawable.dates
          .map(datePeriod =>
            DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate, { format: 'short' }),
          )
          .join(', '),
        checked: false,
        hint: {
          html: linkTo(matchPaths.placementRequests.show({ placementRequestId: prWithdrawable.id }), {
            text: 'See placement details (opens in a new tab)',
            attributes: { 'data-cy-withdrawable-id': prWithdrawable.id },
            openInNewTab: true,
          }),
        },
        value: prWithdrawable.id,
      },
    ]

    it('returns placement (space_bookings) withdrawables in radio input format', () => {
      const placement = cas1SpaceBookingFactory.build()
      const placementWithdrawable = withdrawableFactory.build({ type: 'space_booking', id: placement.id })
      expect(
        withdrawableRadioOptions([paWithdrawable, prWithdrawable, placementWithdrawable], paWithdrawable.id, [
          placement,
        ]),
      ).toEqual([
        ...applicationAndAssesRadios,
        {
          checked: false,
          hint: {
            html: linkTo(
              managePaths.premises.placements.show({ placementId: placement.id, premisesId: placement.premises.id }),
              {
                text: 'See placement details (opens in a new tab)',
                attributes: { 'data-cy-withdrawable-id': placement.id },
                openInNewTab: true,
              },
            ),
          },
          text: `${placement.premises.name} - ${placementWithdrawable.dates
            .map(datePeriod =>
              DateFormats.formatDurationBetweenTwoDates(datePeriod.startDate, datePeriod.endDate, { format: 'short' }),
            )
            .join(', ')}`,
          value: placementWithdrawable.id,
        },
      ])
    })
  })
})
