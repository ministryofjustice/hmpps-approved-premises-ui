import { SummaryListItem } from '@approved-premises/ui'
import { render } from 'nunjucks'
import { FullPerson, RiskEnvelopeStatus } from '@approved-premises/api'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { Request } from 'express'
import { faker } from '@faker-js/faker'
import { card, detailsBody, getPlacementLink, getResidentHeader, residentTabItems, returnPath } from './index'
import { cas1SpaceBookingFactory, risksFactory, userFactory } from '../../testutils/factories'
import { canonicalDates, placementStatusTag } from '../placements'
import { DateFormats } from '../dateUtils'
import managePaths from '../../paths/manage'

import * as backlinkUtils from '../backlinks'
import { fullPersonFactory, restrictedPersonFactory } from '../../testutils/factories/person'

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
          text: 'Health',
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
      const retrieved = { status: 'Retrieved' } as unknown as { status: RiskEnvelopeStatus }
      const personRisks = risksFactory.build({
        roshRisks: { ...retrieved, value: { overallRisk: 'Very High' } },
        mappa: retrieved,
        flags: retrieved,
      })
      const { arrivalDate, departureDate } = canonicalDates(placement)
      expect(getResidentHeader(placement, personRisks)).toEqual({
        name: person.name,
        photoUrl: undefined,
        statusBadge: placementStatusTag(placement),
        badges: [
          // FM-285 '<span class="moj-badge moj-badge--black">Very High RoSH</span>',
          '<span class="moj-badge moj-badge--black">CAT 2 / LEVEL 1 MAPPA</span>',
          ...personRisks.flags.value.map(label => `<span class="moj-badge moj-badge--black">${label}</span>`),
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
      const notRetrieved = { status: 'error', value: undefined } as { status: RiskEnvelopeStatus }
      const personRisks = risksFactory.build({
        roshRisks: notRetrieved,
        mappa: notRetrieved,
        flags: notRetrieved,
      })
      expect(getResidentHeader(placement, personRisks)).toEqual(
        expect.objectContaining({
          statusBadge: placementStatusTag(placement),
          // FM-285 badges: ['<span class="moj-badge moj-badge--black">Unknown RoSH</span>'],
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
          '/manage/premises/:premisesId/placements/:placementId:action',
          {},
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
  })
})
