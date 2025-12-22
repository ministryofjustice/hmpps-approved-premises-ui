import { Cas1SpaceBooking } from '@approved-premises/api'
import { placementTabController } from './placement'
import { cas1SpaceBookingFactory } from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'
import { characteristicsBulletList } from '../characteristicsUtils'
import { placementStatusTag } from '../placements'

describe('tabController', () => {
  const allPlacementStatuses: Array<[string, Cas1SpaceBooking]> = [
    ['upcoming', cas1SpaceBookingFactory.upcoming().build()],
    ['current', cas1SpaceBookingFactory.current().build()],
    ['nonArrival', cas1SpaceBookingFactory.nonArrival().build()],
    ['departed', cas1SpaceBookingFactory.departed().build()],
    ['departedBreachOrRecall', cas1SpaceBookingFactory.departedBreachOrRecall().build()],
    ['departedPlannedMoveOn', cas1SpaceBookingFactory.departedPlannedMoveOn().build()],
    ['cancelled', cas1SpaceBookingFactory.cancelled().build()],
  ]

  it.each(allPlacementStatuses)(
    'should return a details card contain the premises name, date allocated, status, and delius number for %s placements',
    (_, placement) => {
      expect(placementTabController(placement)).toEqual({
        subHeading: `${placement.premises.name} AP placement`,
        cardList: [
          {
            card: { title: { text: placement.premises.name } },
            rows: expect.arrayContaining([
              {
                key: { text: 'Approved Premises' },
                value: { text: placement.premises.name },
              },
              {
                key: { text: 'Date allocated' },
                value: { text: DateFormats.isoDateToUIDate(placement.createdAt) },
              },
              {
                key: { text: 'Status' },
                value: { html: placementStatusTag(placement) },
              },
              {
                key: { text: 'Delius event number' },
                value: { text: placement.deliusEventNumber },
              },
            ]),
          },
        ],
      })
    },
  )

  it.each(allPlacementStatuses)(
    'should return a details card contain the AP type, and AP and room requirements for %s placements',
    (_, placement) => {
      expect(placementTabController(placement)).toEqual({
        subHeading: `${placement.premises.name} AP placement`,
        cardList: [
          {
            card: { title: { text: placement.premises.name } },
            rows: expect.arrayContaining([
              {
                key: { text: 'AP type' },
                value: { text: 'Standard AP' },
              },
              {
                key: { text: 'AP requirements' },
                value: { html: characteristicsBulletList(filterApLevelCriteria(placement.characteristics)) },
              },
              {
                key: { text: 'Room requirements' },
                value: { html: characteristicsBulletList(filterRoomLevelCriteria(placement.characteristics)) },
              },
            ]),
          },
        ],
      })
    },
  )

  it.each([
    ['upcoming', cas1SpaceBookingFactory.upcoming().build(), true],
    ['nonArrival', cas1SpaceBookingFactory.nonArrival().build(), true],
    ['current', cas1SpaceBookingFactory.current().build(), false],
    ['departed', cas1SpaceBookingFactory.departed().build(), false],
  ])('should show expected arrival date for placements that have not arrived - %s', (_, placement, shouldContain) => {
    const expectation = shouldContain ? expect : expect.not
    expect(placementTabController(placement)).toEqual({
      subHeading: `${placement.premises.name} AP placement`,
      cardList: [
        {
          card: { title: { text: placement.premises.name } },
          rows: expectation.arrayContaining([
            {
              key: { text: 'Expected arrival date' },
              value: { text: DateFormats.isoDateToUIDate(placement.expectedArrivalDate) },
            },
          ]),
        },
      ],
    })
  })

  it.each([
    ['upcoming', cas1SpaceBookingFactory.upcoming().build(), false],
    ['nonArrival', cas1SpaceBookingFactory.nonArrival().build(), false],
    ['current', cas1SpaceBookingFactory.current().build(), true],
    ['departed', cas1SpaceBookingFactory.departed().build(), true],
  ])(
    'should show actual arrival date and time for placements that have arrived - %s',
    (_, placement, shouldContain) => {
      const expectation = shouldContain ? expect : expect.not
      expect(placementTabController(placement)).toEqual({
        subHeading: `${placement.premises.name} AP placement`,
        cardList: [
          {
            card: { title: { text: placement.premises.name } },
            rows: expectation.arrayContaining([
              {
                key: { text: 'Actual arrival date' },
                value: {
                  text: placement.actualArrivalDate
                    ? DateFormats.isoDateToUIDate(placement.actualArrivalDate)
                    : expect.any(String),
                },
              },
              {
                key: { text: 'Arrival time' },
                value: { text: DateFormats.formatTime(placement.actualArrivalTime) },
              },
            ]),
          },
        ],
      })
    },
  )

  it.each([
    ['upcoming', cas1SpaceBookingFactory.upcoming().build(), true],
    ['nonArrival', cas1SpaceBookingFactory.nonArrival().build(), true],
    ['current', cas1SpaceBookingFactory.current().build(), true],
    ['departed', cas1SpaceBookingFactory.departed().build(), false],
  ])(
    'should show expected departure date for placements that have not departed - %s',
    (_, placement, shouldContain) => {
      const expectation = shouldContain ? expect : expect.not
      expect(placementTabController(placement)).toEqual({
        subHeading: `${placement.premises.name} AP placement`,
        cardList: [
          {
            card: { title: { text: placement.premises.name } },
            rows: expectation.arrayContaining([
              {
                key: { text: 'Expected departure date' },
                value: { text: DateFormats.isoDateToUIDate(placement.expectedDepartureDate) },
              },
            ]),
          },
        ],
      })
    },
  )

  it.each([
    ['upcoming', cas1SpaceBookingFactory.upcoming().build(), false],
    ['nonArrival', cas1SpaceBookingFactory.nonArrival().build(), false],
    ['current', cas1SpaceBookingFactory.current().build(), false],
    ['departed', cas1SpaceBookingFactory.departed().build(), true],
  ])(
    'should show actual departure date and time for placements that have departed - %s',
    (_, placement, shouldContain) => {
      const expectation = shouldContain ? expect : expect.not
      expect(placementTabController(placement)).toEqual({
        subHeading: `${placement.premises.name} AP placement`,
        cardList: [
          {
            card: { title: { text: placement.premises.name } },
            rows: expectation.arrayContaining([
              {
                key: { text: 'Actual departure date' },
                value: {
                  text: placement.actualDepartureDate
                    ? DateFormats.isoDateToUIDate(placement.actualDepartureDate)
                    : expect.any(String),
                },
              },
              {
                key: { text: 'Departure time' },
                value: { text: DateFormats.formatTime(placement.actualDepartureTime) },
              },
            ]),
          },
        ],
      })
    },
  )
})
