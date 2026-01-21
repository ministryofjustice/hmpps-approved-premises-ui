import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { Cas1SpaceBooking, PersonRisks } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { placementSideNavigation } from '../../utils/resident/placement'
import { personalSideNavigation } from '../../utils/resident/personalUtils'
import { sentenceSideNavigation } from '../../utils/resident/sentenceUtils'
import { ApplicationService, PersonService, PlacementService } from '../../services'

import paths from '../../paths/manage'

import ResidentProfileController from './residentProfileController'
import { cas1SpaceBookingFactory, risksFactory } from '../../testutils/factories'
import { TabData, card, getResidentHeader, ResidentProfileTab, residentTabItems, tabLabels } from '../../utils/resident'
import * as riskTabUtils from '../../utils/resident/risk'
import * as sentenceTabUtils from '../../utils/resident/sentence'
import * as personalTabUtils from '../../utils/resident/personal'
import * as placementTabUtils from '../../utils/resident/placement'
import { ErrorWithData } from '../../utils/errors'
import { riskSideNavigation } from '../../utils/resident/riskUtils'

describe('residentProfileController', () => {
  const token = 'TEST_TOKEN'
  const crn = 'S123456'
  const user = { name: 'username' }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const personService = createMock<PersonService>({})
  const applicationService = createMock<ApplicationService>({})

  const residentProfileController = new ResidentProfileController(placementService, personService, applicationService)

  const setUp = () => {
    const placement = cas1SpaceBookingFactory.upcoming().build()
    const personRisks = risksFactory.build()

    placementService.getPlacement.mockResolvedValue(placement)
    personService.riskProfile.mockResolvedValue(personRisks)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { crn, placementId: placement.id },
    })

    return { placement, personRisks, request, response }
  }

  const tabData: TabData = {
    subHeading: faker.word.words({ count: 2 }),
    cardList: [
      card({
        title: faker.word.words({ count: { min: 1, max: 3 } }),
        html: faker.lorem.words({ min: 10, max: 50 }),
      }),
    ],
  }
  const renderParameters = (placement: Cas1SpaceBooking, personRisks: PersonRisks, tab: ResidentProfileTab) => ({
    placement,
    backLink: paths.premises.show({ premisesId: placement.premises.id }),
    activeTab: tab,
    tabItems: residentTabItems(placement, tab),
    crn,
    pageHeading: tabLabels[tab].label,
    user,
    actions: [] as Array<never>,
    resident: getResidentHeader(placement, personRisks),
  })

  describe('show', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })

    it('should render the Manage resident page on the personal -> personal details tab', async () => {
      const { request, response, placement, personRisks } = setUp()

      const tabController = jest.spyOn(personalTabUtils, 'personalDetailsTabController').mockResolvedValue(tabData)

      await residentProfileController.show('personal', 'personalDetails')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          ...renderParameters(placement, personRisks, 'personal'),
          sideNavigation: personalSideNavigation('personalDetails', crn, placement.id),
          ...tabData,
        },
      ])

      expect(tabController).toBeCalledWith({ crn, personRisks, personService, token, placement })
    })

    it('should render the Sentence -> Offence tab', async () => {
      const { request, response, placement, personRisks } = setUp()

      const tabController = jest.spyOn(sentenceTabUtils, 'sentenceOffencesTabController').mockResolvedValue(tabData)

      await residentProfileController.show('sentence', 'offence')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          ...renderParameters(placement, personRisks, 'sentence'),
          subHeading: 'Offence and sentence',
          tabItems: residentTabItems(placement, 'sentence'),
          sideNavigation: sentenceSideNavigation('offence', crn, placement.id),
          ...tabData,
        },
      ])

      expect(tabController).toHaveBeenCalledWith({ crn, personRisks, personService, token, placement })

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
    })

    it('should render the Risk tab', async () => {
      const { request, response, placement, personRisks } = setUp()

      const tabController = jest.spyOn(riskTabUtils, 'riskTabController').mockResolvedValue(tabData)

      await residentProfileController.show('risk', 'riskDetails')(request, response, next)

      expect(response.render.mock.calls[0]).toEqual([
        'manage/resident/residentProfile',
        {
          sideNavigation: riskSideNavigation('riskDetails', crn, placement.id),
          ...renderParameters(placement, personRisks, 'risk'),
          ...tabData,
        },
      ])

      expect(tabController).toHaveBeenCalledWith(expect.objectContaining({ crn, personService, token }))
    })

    it('should render the placement details tab', async () => {
      const { request, response, placement, personRisks } = setUp()

      const detailsController = jest.spyOn(placementTabUtils, 'placementTabController').mockReturnValue(tabData)

      await residentProfileController.show('placement', 'placementDetails')(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/resident/residentProfile', {
        ...renderParameters(placement, personRisks, 'placement'),
        sideNavigation: placementSideNavigation('placementDetails', crn, placement),
        ...tabData,
      })

      expect(detailsController).toHaveBeenCalledWith(placement)
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
      const { request, response, placement, personRisks } = setUp()

      await residentProfileController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/residentProfile',
        expect.objectContaining({
          resident: getResidentHeader(placement, personRisks),
        }),
      )
    })

    it('should render the page if the risk data API call fails', async () => {
      const errorPersonRisks = {
        roshRisks: { status: 'error' },
        mappa: { status: 'error' },
        flags: { status: 'error' },
        tier: { status: 'error' },
      } as PersonRisks

      const { request, response, placement } = setUp()

      personService.riskProfile.mockImplementation(async () => {
        throw new ErrorWithData({ status: 404 })
      })

      await residentProfileController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/residentProfile',
        expect.objectContaining({
          resident: getResidentHeader(placement, errorPersonRisks),
        }),
      )
    })
  })
})
