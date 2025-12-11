import { SummaryListItem } from '@approved-premises/ui'
import { render } from 'nunjucks'
import { FullPerson, RiskEnvelopeStatus } from '@approved-premises/api'
import { card, detailsBody, getResidentHeader, residentTabItems } from './index'
import { cas1SpaceBookingFactory, risksFactory } from '../../testutils/factories'
import { canonicalDates } from '../placements'
import { DateFormats } from '../dateUtils'

jest.mock('nunjucks')

describe('residentsUtils', () => {
  describe('residentTabItems', () => {
    it('Should generate a list of tab items', () => {
      const placement = cas1SpaceBookingFactory.build()
      const tabs = residentTabItems(placement, 'placement')
      const baseUrl = `/manage/resident/${placement.person.crn}/placement/${placement.id}/`
      expect(tabs).toEqual([
        {
          active: false,
          href: `${baseUrl}personal`,
          text: 'Personal details',
        },
        {
          active: false,
          href: `${baseUrl}health`,
          text: 'Health',
        },
        {
          active: true,
          href: `${baseUrl}placement`,
          text: 'Placement',
        },
        {
          active: false,
          href: `${baseUrl}risk`,
          text: 'Risk',
        },
        {
          active: false,
          href: `${baseUrl}sentence/offence`,
          text: 'Sentence',
        },
        {
          active: false,
          href: `${baseUrl}enforcement`,
          text: 'Enforcement',
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

  describe('detailsBody', () => {
    it('should call nunjucks to render a details section', () => {
      ;(render as jest.Mock).mockReturnValue('rendered-content')
      expect(detailsBody('summary', 'content')).toEqual('rendered-content')

      expect(render).toHaveBeenCalledWith('partials/detailsBlock.njk', { summaryText: 'summary', text: 'content' })
    })
  })

  describe('getResidentHeader', () => {
    it(`should render the resident header`, () => {
      const placement = cas1SpaceBookingFactory.build({
        expectedArrivalDate: '2024-11-16',
        expectedDepartureDate: '2025-03-26',
      })
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
        photoUrl: '/assets/images/resident-placeholder.png',
        badges: [
          '<span class="moj-badge badge--very-high">Very High RoSH</span>',
          '<span class="moj-badge badge--low">CAT 2 / LEVEL 1 MAPPA</span>',
          ...personRisks.flags.value.map(label => `<span class="moj-badge badge--low">${label}</span>`),
          '<span><a href="#">+3 risk flags</a></span>',
        ],
        attributes: [
          [
            { title: 'CRN', description: person.crn },
            { title: 'Approved Premises', description: placement.premises.name },
            { title: 'Key worker', description: placement.keyWorkerAllocation.name },
          ],
          [
            { title: 'Arrival', description: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) },
            { title: 'Departure', description: DateFormats.isoDateToUIDate(departureDate, { format: 'short' }) },
            { title: 'Status', description: 'Overdue arrival' },
            { title: 'Length of stay', description: '18 weeks 4 days' },
          ],
        ],
      })
    })
  })
})
