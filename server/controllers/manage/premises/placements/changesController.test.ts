import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import { PlacementService, PremisesService } from '../../../../services'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../testutils/factories'
import ChangesController from './changesController'
import { occupancySummary } from '../../../../utils/match'
import { occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import paths from '../../../../paths/match'
import { placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { durationSelectOptions, occupancyCriteriaMap } from '../../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { DateFormats } from '../../../../utils/dateUtils'

describe('changesController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const premisesService = createMock<PremisesService>()
  const changesController = new ChangesController(placementService, premisesService)

  const premises = cas1PremisesFactory.build()
  const placement = cas1SpaceBookingFactory.upcoming().build({ premises })
  const capacity = cas1PremiseCapacityFactory.build()

  beforeEach(() => {
    jest.clearAllMocks()

    placementService.getPlacement.mockResolvedValue(placement)
    premisesService.getCapacity.mockResolvedValue(capacity)
    request = createMock<Request>({
      user: { token },
      params: { premisesId: premises.id, placementId: placement.id },
      flash: jest.fn(),
      query: {},
    })
  })

  it('renders the change placement screen with current booking information', async () => {
    const requestHandler = changesController.new()
    await requestHandler(request, response, next)

    const expectedCriteria = filterRoomLevelCriteria(placement.requirements.essentialCharacteristics)
    const expectedPlaceholderDayUrl = `${paths.v2Match.placementRequests.search.dayOccupancy({
      id: placement.requestForPlacementId,
      premisesId: premises.id,
      date: ':date',
    })}?${createQueryString({ criteria: expectedCriteria, excludeSpaceBookingId: placement.id })}`
    const expectedDuration = differenceInDays(placement.expectedDepartureDate, placement.expectedArrivalDate)

    expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
    expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
      startDate: placement.expectedArrivalDate,
      endDate: placement.expectedDepartureDate,
      excludeSpaceBookingId: placement.id,
    })
    expect(response.render).toHaveBeenCalledWith('manage/premises/placements/changes', {
      pageHeading: 'Change placement dates',
      placement,
      placementSummary: placementOverviewSummary(placement),
      durationOptions: durationSelectOptions(expectedDuration),
      criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, expectedCriteria),
      startDate: placement.expectedArrivalDate,
      ...DateFormats.isoDateToDateInputs(placement.expectedArrivalDate, 'startDate'),
      durationDays: expectedDuration,
      summary: occupancySummary(capacity.capacity, expectedCriteria),
      calendar: occupancyCalendar(capacity.capacity, expectedPlaceholderDayUrl, expectedCriteria),
      errorSummary: [],
      errors: {},
    })
  })

  describe('when filtering the view', () => {
    it('renders the change placement screen with a filtered view', async () => {
      const query = {
        'startDate-day': '12',
        'startDate-month': '5',
        'startDate-year': '2025',
        durationDays: '7',
        criteria: 'hasEnSuite',
      }

      const filterCriteria = makeArrayOfType<Cas1SpaceBookingCharacteristic>(query.criteria)

      const requestHandler = changesController.new()
      await requestHandler({ ...request, query }, response, next)

      const placeholderDetailsUrl = `${paths.v2Match.placementRequests.search.dayOccupancy({
        id: placement.requestForPlacementId,
        premisesId: premises.id,
        date: ':date',
      })}?${createQueryString({ criteria: filterCriteria, excludeSpaceBookingId: placement.id })}`

      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
        startDate: '2025-05-12',
        endDate: '2025-05-19',
        excludeSpaceBookingId: placement.id,
      })
      expect(response.render.mock.lastCall[1]).toEqual(
        expect.objectContaining({
          summary: occupancySummary(capacity.capacity, filterCriteria),
          calendar: occupancyCalendar(capacity.capacity, placeholderDetailsUrl, filterCriteria),
          durationOptions: durationSelectOptions(Number(query.durationDays)),
          criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, filterCriteria),
          'startDate-day': '12',
          'startDate-month': '5',
          'startDate-year': '2025',
        }),
      )
    })

    it('shows an error and does not display summary or calendar if the filter date is invalid', async () => {
      const query = {
        'startDate-day': '12',
        'startDate-year': '2025',
        durationDays: '7',
      }

      const requestHandler = changesController.new()
      await requestHandler({ ...request, query }, response, next)

      expect(premisesService.getCapacity).not.toHaveBeenCalled()
      expect(response.render.mock.lastCall[1]).toEqual(
        expect.objectContaining({
          summary: undefined,
          calendar: undefined,
          durationOptions: durationSelectOptions(Number(query.durationDays)),
          criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, []),
          errorSummary: [{ text: 'Enter a valid date', href: '#startDate' }],
          errors: {
            startDate: {
              attributes: { 'data-cy-error-startDate': true },
              text: 'Enter a valid date',
            },
          },
          'startDate-day': '12',
          'startDate-year': '2025',
        }),
      )
    })
  })
})
