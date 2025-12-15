import { placementDetailsCards, placementTabController } from './placement'
import { cas1SpaceBookingFactory } from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'
import { characteristicsBulletList } from '../characteristicsUtils'

describe('tabController', () => {
  it('should return the details cards', () => {
    const placement = cas1SpaceBookingFactory.current().build()

    expect(placementTabController(placement)).toEqual({
      subHeading: 'Current placement',
      cardList: [
        {
          card: { title: { text: placement.premises.name } },
          rows: [
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
              value: {
                html: '<strong class="govuk-tag govuk-tag--green govuk-tag--nowrap " data-cy-status="arrived" >Arrived</strong>',
              },
            },
            {
              key: { text: 'NDelius event number' },
              value: { text: placement.deliusEventNumber },
            },
            {
              key: { text: 'Expected arrival date' },
              value: { text: DateFormats.isoDateToUIDate(placement.expectedArrivalDate) },
            },
            {
              key: { text: 'Actual arrival date' },
              value: { text: DateFormats.isoDateToUIDate(placement.actualArrivalDate) },
            },
            {
              key: { text: 'Arrival time' },
              value: { text: placement.actualArrivalTime },
            },
            {
              key: { text: 'Expected departure date' },
              value: { text: DateFormats.isoDateToUIDate(placement.expectedDepartureDate) },
            },
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
          ],
        },
      ],
    })
  })
})

describe('detailsCards', () => {
  it('should render the details cards for a non arrival', () => {
    const placement = cas1SpaceBookingFactory.nonArrival().build()

    expect(placementDetailsCards(placement)).toEqual([
      {
        card: { title: { text: placement.premises.name } },
        rows: [
          { key: { text: 'Approved Premises' }, value: { text: placement.premises.name } },
          { key: { text: 'Date allocated' }, value: { text: DateFormats.isoDateToUIDate(placement.createdAt) } },
          {
            key: { text: 'Status' },
            value: {
              html: '<strong class="govuk-tag govuk-tag--red govuk-tag--nowrap " data-cy-status="notArrived" >Not arrived</strong>',
            },
          },
          { key: { text: 'NDelius event number' }, value: { text: placement.deliusEventNumber } },
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(placement.expectedArrivalDate) },
          },
          {
            key: { text: 'Expected departure date' },
            value: { text: DateFormats.isoDateToUIDate(placement.expectedDepartureDate) },
          },
          { key: { text: 'AP type' }, value: { text: 'Standard AP' } },
          {
            key: { text: 'AP requirements' },
            value: {
              html: characteristicsBulletList(filterApLevelCriteria(placement.characteristics)),
            },
          },
          {
            key: { text: 'Room requirements' },
            value: {
              html: characteristicsBulletList(filterRoomLevelCriteria(placement.characteristics)),
            },
          },
        ],
      },
    ])
  })

  it('should render the details cards for a departed placement', () => {
    const placement = cas1SpaceBookingFactory.departed().build()

    expect(placementDetailsCards(placement)).toEqual([
      {
        card: { title: { text: placement.premises.name } },
        rows: [
          { key: { text: 'Approved Premises' }, value: { text: placement.premises.name } },
          { key: { text: 'Date allocated' }, value: { text: DateFormats.isoDateToUIDate(placement.createdAt) } },
          {
            key: { text: 'Status' },
            value: {
              html: '<strong class="govuk-tag govuk-tag--grey govuk-tag--nowrap " data-cy-status="departed" >Departed</strong>',
            },
          },
          { key: { text: 'NDelius event number' }, value: { text: placement.deliusEventNumber } },
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(placement.expectedArrivalDate) },
          },
          {
            key: { text: 'Actual arrival date' },
            value: { text: DateFormats.isoDateToUIDate(placement.actualArrivalDate) },
          },
          {
            key: { text: 'Expected departure date' },
            value: { text: DateFormats.isoDateToUIDate(placement.expectedDepartureDate) },
          },
          {
            key: { text: 'Actual departure date' },
            value: { text: DateFormats.isoDateToUIDate(placement.actualDepartureDate) },
          },
          {
            key: { text: 'Departure time' },
            value: { text: placement.actualDepartureTime },
          },
          {
            key: { text: 'Departure reason' },
            value: { text: placement.departure.reason.name },
          },
          {
            key: { text: 'Departure notes' },
            value: { text: placement.departure.notes },
          },
          { key: { text: 'AP type' }, value: { text: 'Standard AP' } },
          {
            key: { text: 'AP requirements' },
            value: {
              html: characteristicsBulletList(filterApLevelCriteria(placement.characteristics)),
            },
          },
          {
            key: { text: 'Room requirements' },
            value: {
              html: characteristicsBulletList(filterRoomLevelCriteria(placement.characteristics)),
            },
          },
        ],
      },
    ])
  })
})
