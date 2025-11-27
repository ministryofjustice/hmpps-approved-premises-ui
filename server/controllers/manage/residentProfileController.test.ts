import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import { PersonService, PlacementService } from '../../services'

import paths from '../../paths/manage'

import ResidentProfileController from './residentProfileController'
import { activeOffenceFactory, cas1OasysGroupFactory, cas1SpaceBookingFactory } from '../../testutils/factories'
import { getResidentHeader, ResidentProfileTab, residentTabItems, tabLabels } from '../../utils/resident'
import { placementKeyDetails } from '../../utils/placements'
import { offencesCards, sentenceSideNavigation } from '../../utils/resident/sentence'

describe('residentProfileController', () => {
  const token = 'TEST_TOKEN'
  const crn = 'S123456'
  const user = { name: 'username' }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const personService = createMock<PersonService>({})
  const residentProfileController = new ResidentProfileController(placementService, personService)

  const setUp = () => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    const placement = cas1SpaceBookingFactory.upcoming().build({
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })
    const offences = activeOffenceFactory.buildList(3)
    const oasysGroup = cas1OasysGroupFactory.offenceDetails().build()

    placementService.getPlacement.mockResolvedValue(placement)

    personService.getOffences.mockResolvedValue(offences)
    personService.getOasysAnswers.mockResolvedValue(oasysGroup)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { crn, placementId: placement.id },
    })
    return { placement, request, response, oasysGroup, offences }
  }

  const renderParameters = (placement: Cas1SpaceBooking, tab: ResidentProfileTab) => ({
    placement,
    backLink: paths.premises.show({ premisesId: placement.premises.id }),
    activeTab: tab,
    tabItems: residentTabItems(placement, tab),
    crn,
    pageHeading: tabLabels[tab].label,
    contextKeyDetails: placementKeyDetails(placement),
    user,
    actions: [] as Array<never>,
    resident: getResidentHeader(placement),
  })

  describe('show', () => {
    it('should render the Manage resident page on default tab', async () => {
      const { request, response, placement } = setUp()

      await residentProfileController.show()(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        { ...renderParameters(placement, 'personal') },
      ])
    })

    it('should render the Manage resident page on the sentence tab', async () => {
      const { request, response, placement, offences, oasysGroup } = setUp()

      await residentProfileController.show('sentence', 'offence')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          ...renderParameters(placement, 'sentence'),
          subHeading: 'Offence and sentence',
          tabItems: residentTabItems(placement, 'sentence'),
          cardList: offencesCards(offences, oasysGroup),
          sideNavigation: sentenceSideNavigation('offence', crn, placement.id),
        },
      ])

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)

      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)

      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
    })
    it('should render the Manage resident page on sentence tab', async () => {
      const { request, response, placement, offences, oasysGroup } = setUp()

      await residentProfileController.show('sentence', 'offence')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          placement,
          backLink: paths.premises.show({ premisesId: placement.premises.id }),
          activeTab: 'sentence',
          tabItems: residentTabItems(placement, 'sentence'),
          crn,
          arrivalDate: placement.expectedArrivalDate,
          departureDate: placement.expectedDepartureDate,
          pageHeading: 'Sentence',
          subHeading: 'Offence and sentence',
          contextKeyDetails: placementKeyDetails(placement),
          user,
          cardList: offencesCards(offences, oasysGroup),
          sideNavigation: sentenceSideNavigation('offence', crn, placement.id),
        },
      ])
    })
  })

  it('should render the Manage resident page with the correct actions for an upcoming placement', async () => {
    const { request, response, placement } = setUp()

    response.locals.user.permissions = [
      'cas1_space_booking_record_arrival',
      'cas1_space_booking_record_non_arrival',
      'cas1_placement_appeal_create',
      'cas1_space_booking_create',
    ]

    const handler = residentProfileController.show()
    await handler(request, response, next)

    expect(response.render).toHaveBeenCalledWith(
      'manage/resident/residentProfile',
      expect.objectContaining({
        actions: [
          {
            text: 'Record arrival',
            href: `/manage/premises/${placement.premises.id}/placements/${placement.id}/arrival`,
            classes: 'govuk-button--secondary',
          },
          {
            text: 'Record non-arrival',
            href: `/manage/premises/${placement.premises.id}/placements/${placement.id}/non-arrival`,
            classes: 'govuk-button--secondary',
          },
          {
            text: 'Request an appeal',
            href: `/manage/premises/${placement.premises.id}/placements/${placement.id}/appeal/new`,
            classes: 'govuk-button--secondary',
          },
          {
            text: 'Change placement',
            href: `/manage/premises/${placement.premises.id}/placements/${placement.id}/changes/new`,
            classes: 'govuk-button--secondary',
          },
        ],
      }),
    )
  })

  it('should render the Manage resident page with the residents banner', async () => {
    const { request, response, placement } = setUp()
    const person = placement.person as FullPerson

    const handler = residentProfileController.show()
    await handler(request, response, next)

    expect(response.render).toHaveBeenCalledWith(
      'manage/resident/residentProfile',
      expect.objectContaining({
        resident: {
          name: person.name,
          photoUrl: '/assets/images/resident-placeholder.png',
          badges: [
            '<span class="moj-badge moj-badge--red">Unknown RoSH</span>',
            '<span class="moj-badge moj-badge--purple">Unknown MAPPA</span>',
            '<span class="moj-badge moj-badge--black">Unknown </span>',
            '<span class="moj-badge moj-badge--black">Unknown 2</span>',
            '<span class="moj-badge moj-badge--black">Unknown 3</span>',
            '<span><a href="#">+3 risk flags</a></span>',
          ],
          attributes: [
            [
              { title: 'CRN', description: person.crn },
              { title: 'Approved Premises', description: placement.premises.name },
              { title: 'Key worker', description: placement.keyWorkerAllocation.name },
            ],
            [
              { title: 'Arrival', description: '16 Nov 2024' },
              { title: 'Departure', description: '26 Mar 2025' },
              { title: 'Status', description: 'Overdue arrival' },
              { title: 'Length of stay', description: '18 weeks 4 days' },
            ],
          ],
        },
      }),
    )
  })
})
