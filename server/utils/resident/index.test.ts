import { SummaryListItem } from '@approved-premises/ui'
import { render } from 'nunjucks'
import { card, detailsBody, residentTabItems, tabLabels } from './index'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

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
          href: `${baseUrl}placement/placement-details`,
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

    it('falls back to the resident show path when a tab has no explicit route', () => {
      const placement = cas1SpaceBookingFactory.build()
      const uknownLabel = 'label123'
      const tabLabelsRecord = tabLabels as unknown as Record<string, { label: string }>
      tabLabelsRecord.mystery = { label: uknownLabel }

      const tabs = residentTabItems(placement, 'personal')
      const mysteryTab = tabs.find(tab => tab.text === uknownLabel)

      expect(mysteryTab).toEqual({
        active: false,
        href: `/manage/resident/${placement.person.crn}/placement/${placement.id}`,
        text: uknownLabel,
      })

      delete tabLabelsRecord.mystery
    })
  })

  describe('card', () => {
    it('should generate a card', () => {
      const rows: Array<SummaryListItem> = [
        { key: { text: 'key1' }, value: { text: 'val1' } },
        { key: { text: 'key2' }, value: { text: 'val2' } },
      ]
      expect(card('title', rows)).toEqual({
        card: {
          title: {
            text: 'title',
          },
        },
        rows,
      })
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
