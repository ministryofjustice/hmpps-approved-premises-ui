import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { FullPerson } from '@approved-premises/api'
import type { PlacementService } from '../../services'

import paths from '../../paths/manage'

import ResidentProfileController from './residentProfileController'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

jest.mock('../../utils/resident', () => ({
  ...jest.requireActual('../../utils/resident'),
  renderPlacementSection: jest.fn().mockReturnValue('<p>Mock section content</p>'),
}))

describe('residentProfileController', () => {
  const token = 'TEST_TOKEN'
  const crn = 'S123456'
  const user = { name: 'username' }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementService = createMock<PlacementService>({})
  const residentProfileController = new ResidentProfileController(placementService)

  const setUp = (section?: string) => {
    jest.resetAllMocks()
    jest.useFakeTimers()

    const placement = cas1SpaceBookingFactory.upcoming().build({
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })
    placementService.getPlacement.mockResolvedValue(placement)

    const response: DeepMocked<Response> = createMock<Response>({ locals: { user } })
    const request: DeepMocked<Request> = createMock<Request>({
      user: { token },
      params: { crn, placementId: placement.id, ...(section && { section }) },
    })
    return { placement, request, response }
  }

  describe('show', () => {
    it('should render the Manage resident page on default tab (personal)', async () => {
      const { request, response, placement } = setUp()

      await residentProfileController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/tabs/personal',
        expect.objectContaining({
          placement,
          pageHeading: 'Manage a resident',
          backLink: paths.premises.show({ premisesId: placement.premises.id }),
          activeTab: 'personal',
        }),
      )
    })

    it('should render the correct tab template for each tab', async () => {
      const { request, response, placement } = setUp()

      await residentProfileController.show('health')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/tabs/health',
        expect.objectContaining({
          placement,
          activeTab: 'health',
        }),
      )
    })

    it('should render the placement tab with sidebar on default section', async () => {
      const { request, response, placement } = setUp()

      await residentProfileController.show('placement')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/tabs/placement',
        expect.objectContaining({
          placement,
          pageHeading: 'Manage a resident',
          backLink: paths.premises.show({ premisesId: placement.premises.id }),
          activeTab: 'placement',
          activeSection: 'placement-details',
          sectionHeading: 'Placement details',
          sidebarItems: expect.any(Array),
        }),
      )
    })

    it('should render the placement tab with section from params', async () => {
      const { request, response, placement } = setUp('previous-ap-stays')

      await residentProfileController.show('placement')(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/resident/tabs/placement',
        expect.objectContaining({
          placement,
          activeTab: 'placement',
          activeSection: 'previous-ap-stays',
          sectionHeading: 'Previous AP stays',
          sidebarItems: expect.any(Array),
        }),
      )
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
      'manage/resident/tabs/personal',
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
      'manage/resident/tabs/personal',
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
