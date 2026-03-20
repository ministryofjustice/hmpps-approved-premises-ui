import { SummaryListItem } from '@approved-premises/ui'
import { render } from 'nunjucks'
import { FullPerson } from '@approved-premises/api'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { Request } from 'express'
import { faker } from '@faker-js/faker'
import {
  card,
  combineResultAndContent,
  detailsBody,
  getPlacementLink,
  getResidentHeader,
  loadingErrorMessage,
  residentTabItems,
  returnPath,
} from './index'
import { cas1SpaceBookingFactory, caseDetailFactory, userFactory } from '../../testutils/factories'
import { canonicalDates, placementStatusTag } from '../placements'
import { DateFormats } from '../dateUtils'
import managePaths from '../../paths/manage'

import * as backlinkUtils from '../backlinks'
import { fullPersonFactory, restrictedPersonFactory } from '../../testutils/factories/person'
import { registrationFactory } from '../../testutils/factories/caseDetail'

jest.mock('nunjucks')

describe('residentsUtils', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe('residentTabItems', () => {
    it('Should generate a list of tab items', () => {
      const placement = cas1SpaceBookingFactory.build()
      const tabs = residentTabItems(placement, 'placement')
      const baseUrl = `/manage/resident/${placement.person.crn}/placement/${placement.id}/`
      expect(tabs).toEqual([
        {
          active: false,
          href: `${baseUrl}personal/personalDetails`,
          text: 'Personal details',
        },
        {
          active: false,
          href: `${baseUrl}health/healthDetails`,
          text: 'Health and wellbeing',
        },
        {
          active: true,
          href: `${baseUrl}placement/placement`,
          text: 'Placement',
        },
        {
          active: false,
          href: `${baseUrl}risk/riskDetails`,
          text: 'Risk',
        },
        {
          active: false,
          href: `${baseUrl}sentence/offence`,
          text: 'Sentence',
        },
        {
          active: false,
          href: `${baseUrl}drugAndAlcohol`,
          text: 'Drug and alcohol',
        },
      ])
    })
  })

  describe('card', () => {
    it('should generate a card', () => {
      const rows: Array<SummaryListItem> = [
        { key: { text: 'key1' }, value: { text: 'val1' } },
        { key: { text: 'key2' }, value: { text: 'val2' } },
      ]
      expect(card({ title: 'title', rows })).toEqual({
        card: {
          title: {
            text: 'title',
          },
        },
        rows,
      })
    })
  })

  describe('Template renderers', () => {
    beforeEach(() => {
      ;(render as jest.Mock).mockImplementation((templateName: string) => `render "${templateName}"`)
    })

    describe('detailsBody', () => {
      it('should call nunjucks to render a details section', () => {
        expect(detailsBody('summary', 'content')).toEqual('render "partials/detailsBlock.njk"')

        expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', { summaryText: 'summary', text: 'content' })
      })
    })

    describe('insetText', () => {
      it('should call nunjucks to render an inset text ', () => {
        expect(detailsBody('summary', 'content')).toEqual('render "partials/detailsBlock.njk"')

        expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', { summaryText: 'summary', text: 'content' })
      })
    })
  })

  describe('getResidentHeader', () => {
    const placement = cas1SpaceBookingFactory.upcoming().build({
      expectedArrivalDate: '2024-11-16',
      expectedDepartureDate: '2025-03-26',
    })

    it(`should render the resident header`, () => {
      const person = placement.person as FullPerson
      // The API currently returns capitalised strings that contradict the type.
      const caseDetail = caseDetailFactory.build({
        registrations: [
          registrationFactory.build({ code: 'RVHR', description: 'Very High RoSH', startDate: undefined }),
          registrationFactory.build({ code: 'MAPP', description: 'CAT 2 / LEVEL 1', startDate: undefined }),
          registrationFactory.build({ code: 'OTHER', description: 'Other risk', startDate: undefined }),
        ],
      })

      const { arrivalDate, departureDate } = canonicalDates(placement)
      expect(getResidentHeader(placement, caseDetail)).toEqual({
        name: person.name,
        photoUrl: undefined,
        statusBadge: placementStatusTag(placement),
        badges: [
          '<span class="moj-badge moj-badge--black">Very High RoSH</span>',
          '<span class="moj-badge moj-badge--black">CAT 2 / LEVEL 1 MAPPA</span>',
          `<span class="moj-badge moj-badge--black">Other risk</span>`,
        ],

        attributes: [
          [
            { title: 'CRN', description: person.crn },
            { title: 'AP', description: placement.premises.name },
            { title: 'Arrival', description: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) },
            { title: 'Departure', description: DateFormats.isoDateToUIDate(departureDate, { format: 'short' }) },
            { title: 'Length of stay', description: '18 weeks 4 days' },
          ],
        ],
      })
    })

    it(`should render the resident header, even if the risks cannot be retrieved`, () => {
      expect(getResidentHeader(placement, undefined)).toEqual(
        expect.objectContaining({
          statusBadge: placementStatusTag(placement),
          badges: ['<span class="moj-badge moj-badge--black">No RoSH</span>'],
        }),
      )
    })
  })

  describe('Link management', () => {
    const pagePattern = 'page-Pattern'

    const mockRequest = (
      referer: string,
      lastStoredReferer: string,
      permissions?: Array<string>,
    ): DeepMocked<Request> =>
      createMock<Request>({
        headers: { referer },
        session: {
          pageReferers: {
            [pagePattern]: lastStoredReferer,
          },
          user: { permissions: permissions || [] },
        },
      })

    const matchingReferer = 'http://domain/pattern1/112233445566'

    describe('returnPath', () => {
      it('should get the session backlink with the correct parameters', () => {
        const placement = cas1SpaceBookingFactory.build()
        const request = mockRequest(matchingReferer, undefined)
        jest.spyOn(backlinkUtils, 'getPageBackLink').mockReturnValue('backlink')

        expect(returnPath(request, placement)).toEqual('backlink')

        expect(backlinkUtils.getPageBackLink).toHaveBeenCalledWith(
          `/manage/premises/${placement.premises.id}/placements/${placement.id}:action`,
          request,
          [
            '/manage/premises/:premisesId/placements/:placementId',
            '/manage/resident/:crn/placement/:placementId{/*tab}',
          ],
          `/manage/premises/${placement.premises.id}/placements/${placement.id}`,
        )
      })
    })

    describe('getPlacementLink', () => {
      const requestWithPermission: DeepMocked<Request> = createMock<Request>({
        session: { user: userFactory.build({ permissions: ['cas1_ap_resident_profile'] }) },
      })
      const fullPerson = fullPersonFactory.build()
      const [premisesId, placementId] = [faker.string.uuid(), faker.string.uuid()]

      it('returns the resident profile page url if the user has permission and the person is not restricted', () => {
        expect(
          getPlacementLink({ request: requestWithPermission, person: fullPerson, premisesId, placementId }),
        ).toEqual(managePaths.resident.show({ placementId, crn: fullPerson.crn }))
      })

      it('returns the legacy placement page url if the user lacks permission or the person is restricted', () => {
        const legacyUrl = managePaths.premises.placements.show({ premisesId, placementId })
        const restrictedPerson = restrictedPersonFactory.build()
        const requestWithoutPermission: DeepMocked<Request> = createMock<Request>({
          session: { user: userFactory.build() },
        })

        expect(
          getPlacementLink({ request: requestWithoutPermission, person: fullPerson, premisesId, placementId }),
        ).toEqual(legacyUrl)
        expect(
          getPlacementLink({ request: requestWithPermission, person: restrictedPerson, premisesId, placementId }),
        ).toEqual(legacyUrl)
      })
    })

    describe('loadingErrorMessage', () => {
      it('generates an error message based on the API request outcome', () => {
        expect(loadingErrorMessage('success', '(item)', 'dps')).toEqual(undefined)
        expect(loadingErrorMessage('notFound', '(item)', 'dps')).toEqual(
          'No (item) information found in Digital Prison Service (DPS)',
        )
        expect(loadingErrorMessage('failure', '(item)', 'dps')).toEqual(
          'We cannot load (item) information right now because Digital Prison Service (DPS) is not available.<br>Try again later',
        )
      })
      it('combines an API outcome with the existence of content', () => {
        expect(combineResultAndContent('success', 'some string')).toEqual('success')
        expect(combineResultAndContent('success', undefined)).toEqual('notFound')
        expect(combineResultAndContent('failure', undefined)).toEqual('failure')
      })
    })
  })
})
