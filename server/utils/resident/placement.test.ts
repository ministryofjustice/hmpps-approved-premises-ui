import { placementTabController } from './placement'
import { cas1SpaceBookingFactory } from '../../testutils/factories'
import { DateFormats, twelveHourTime } from '../dateUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'
import { characteristicsBulletList } from '../characteristicsUtils'
import { placementStatusTag } from '../placements'

describe('tabController', () => {
  const allPlacementStatuses = [
    [cas1SpaceBookingFactory.upcoming().build()],
    [cas1SpaceBookingFactory.current().build()],
    [cas1SpaceBookingFactory.nonArrival().build()],
    [cas1SpaceBookingFactory.departed().build()],
    [cas1SpaceBookingFactory.departedBreachOrRecall().build()],
    [cas1SpaceBookingFactory.departedPlannedMoveOn().build()],
    [cas1SpaceBookingFactory.cancelled().build()],
  ]

  it.each(allPlacementStatuses)(
    'should return a details card contain the premises name, date allocated, status, and delius number for all placements',
    placement => {
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
                value: { text: DateFormats.isoDateToUIDate(placement.createdAt, { format: 'short' }) },
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
    'should return a details card contain the AP and room requirements for all placements',
    placement => {
      expect(placementTabController(placement)).toEqual({
        subHeading: `${placement.premises.name} AP placement`,
        cardList: [
          {
            card: { title: { text: placement.premises.name } },
            rows: expect.arrayContaining([
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
    [cas1SpaceBookingFactory.upcoming().build(), true],
    [cas1SpaceBookingFactory.nonArrival().build(), true],
    [cas1SpaceBookingFactory.current().build(), false],
    [cas1SpaceBookingFactory.departed().build(), false],
  ])('should show expected arrival date for placements that have not arrived', (placement, shouldContain) => {
    const expectation = shouldContain ? expect : expect.not
    expect(placementTabController(placement)).toEqual({
      subHeading: `${placement.premises.name} AP placement`,
      cardList: [
        {
          card: { title: { text: placement.premises.name } },
          rows: expectation.arrayContaining([
            {
              key: { text: 'Expected arrival date' },
              value: { text: DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'short' }) },
            },
          ]),
        },
      ],
    })
  })

  it.each([
    [cas1SpaceBookingFactory.upcoming().build(), false],
    [cas1SpaceBookingFactory.nonArrival().build(), false],
    [cas1SpaceBookingFactory.current().build(), true],
    [cas1SpaceBookingFactory.departed().build(), true],
  ])('should show actual arrival date and time for placements that have arrived', (placement, shouldContain) => {
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
                  ? DateFormats.isoDateToUIDate(placement.actualArrivalDate, { format: 'short' })
                  : expect.any(String),
              },
            },
            {
              key: { text: 'Arrival time' },
              value: { text: twelveHourTime(placement.actualArrivalTime) },
            },
          ]),
        },
      ],
    })
  })

  it.each([
    [cas1SpaceBookingFactory.upcoming().build(), true],
    [cas1SpaceBookingFactory.nonArrival().build(), true],
    [cas1SpaceBookingFactory.current().build(), true],
    [cas1SpaceBookingFactory.departed().build(), false],
  ])('should show expected departure date for placements that have not departed', (placement, shouldContain) => {
    const expectation = shouldContain ? expect : expect.not
    expect(placementTabController(placement)).toEqual({
      subHeading: `${placement.premises.name} AP placement`,
      cardList: [
        {
          card: { title: { text: placement.premises.name } },
          rows: expectation.arrayContaining([
            {
              key: { text: 'Expected departure date' },
              value: { text: DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'short' }) },
            },
          ]),
        },
      ],
    })
  })

  it.each([
    [cas1SpaceBookingFactory.upcoming().build(), false],
    [cas1SpaceBookingFactory.nonArrival().build(), false],
    [cas1SpaceBookingFactory.current().build(), false],
    [cas1SpaceBookingFactory.departed().build(), true],
  ])('should show actual departure date and time for placements that have departed', (placement, shouldContain) => {
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
                  ? DateFormats.isoDateToUIDate(placement.actualDepartureDate, { format: 'short' })
                  : expect.any(String),
              },
            },
            {
              key: { text: 'Departure time' },
              value: { text: twelveHourTime(placement.actualDepartureTime) },
            },
          ]),
        },
      ],
    })
  })
})
