import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { PersonService, PlacementService } from '../../services'

import paths from '../../paths/manage'

import ResidentProfileController from './residentProfileController'
import { cas1SpaceBookingFactory } from '../../testutils/factories'
import { TabData, card, getResidentHeader, ResidentProfileTab, residentTabItems, tabLabels } from '../../utils/resident'
import { placementKeyDetails } from '../../utils/placements'
import * as riskTabUtils from '../../utils/resident/risk'
import * as sentenceTabUtils from '../../utils/resident/sentence'
import * as placementTabUtils from '../../utils/resident/placement'
import { placementSideNavigation } from '../../utils/resident/placement'

describe('residentProfileController', () => {
  const token = 'TEST_TOKEN'
  const crn = 'S123456'
  const user = { name: 'username' }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const personService = createMock<PersonService>({})
  const residentProfileController = new ResidentProfileController(placementService, personService)

  const setUp = () => {
    const placement = cas1SpaceBookingFactory.upcoming().build({
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })

    placementService.getPlacement.mockResolvedValue(placement)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { crn, placementId: placement.id },
    })
    return { placement, request, response }
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
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should render the Manage resident page on default tab', async () => {
      const { request, response, placement } = setUp()

      await residentProfileController.show()(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        { ...renderParameters(placement, 'personal') },
      ])
    })

    it('should render the Sentence -> Offence tab', async () => {
      const { request, response, placement } = setUp()

      const tabData: TabData = {
        subHeading: 'OASys risks',
        cardList: [
          card({
            title: faker.word.words({ count: { min: 1, max: 3 } }),
            html: faker.lorem.words({ min: 10, max: 50 }),
          }),
        ],
      }
      const tabController = jest.spyOn(sentenceTabUtils, 'sentenceOffencesTabController').mockResolvedValue(tabData)

      await residentProfileController.show('sentence', 'offence')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          ...renderParameters(placement, 'sentence'),
          subHeading: 'Offence and sentence',
          tabItems: residentTabItems(placement, 'sentence'),
          sideNavigation: sentenceTabUtils.sentenceSideNavigation('offence', crn, placement.id),
          ...tabData,
        },
      ])

      expect(tabController).toHaveBeenCalledWith({ crn, personService, token })

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
    })

    it('should render the Risk tab', async () => {
      const { request, response, placement } = setUp()
      const tabData: TabData = {
        subHeading: 'OASys risks',
        cardList: [
          card({
            title: faker.word.words({ count: { min: 1, max: 3 } }),
            html: faker.lorem.words({ min: 10, max: 50 }),
          }),
        ],
      }

      const tabController = jest.spyOn(riskTabUtils, 'riskTabController').mockResolvedValue(tabData)

      await residentProfileController.show('risk')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          ...renderParameters(placement, 'risk'),
          ...tabData,
        },
      ])

      expect(tabController).toHaveBeenCalledWith(expect.objectContaining({ crn, personService, token }))
    })

    it('should render the Manage resident page on the placement tab previous AP stays sub tab', async () => {
      const { request, response, placement } = setUp()
      const tabData: TabData = {
        subHeading: 'Previous AP stays',
        cardList: [
          card({
            title: faker.word.words({ count: { min: 1, max: 3 } }),
            rows: [],
          }),
        ],
      }

      const tabController = jest
        .spyOn(placementTabUtils, 'placementPreviousApStaysTabController')
        .mockResolvedValue(tabData)

      await residentProfileController.show('placement', 'previous-ap-stays')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          ...renderParameters(placement, 'placement'),
          tabItems: residentTabItems(placement, 'placement'),
          sideNavigation: placementSideNavigation('previous-ap-stays', crn, placement.id),
          ...tabData,
        },
      ])

      expect(tabController).toHaveBeenCalledWith(
        expect.objectContaining({
          crn,
          personService,
          token,
          placementId: placement.id,
          includeCancelled: false,
        }),
      )
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
})
