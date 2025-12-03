import nunjucks from 'nunjucks'
import { residentTabItems, placementSidebarItems, renderPlacementSection } from './index'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

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
          text: 'Personal Details',
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
          href: `${baseUrl}sentence`,
          text: 'Offence and sentence',
        },
        {
          active: false,
          href: `${baseUrl}enforcement`,
          text: 'Enforcement',
        },
      ])
    })
  })

  describe('placementSidebarItems', () => {
    it('Should generate a list of sidebar items for placement section', () => {
      const placement = cas1SpaceBookingFactory.build()
      const sidebarItems = placementSidebarItems(placement, 'previous-ap-stays')
      const baseUrl = `/manage/resident/${placement.person.crn}/placement/${placement.id}/placement/`
      expect(sidebarItems).toEqual([
        {
          active: false,
          href: `${baseUrl}placement-details`,
          text: 'Placement details',
        },
        {
          active: false,
          href: `${baseUrl}application`,
          text: 'Application',
        },
        {
          active: true,
          href: `${baseUrl}previous-ap-stays`,
          text: 'Previous AP stays',
        },
        {
          active: false,
          href: `${baseUrl}pre-arrival`,
          text: 'Pre-arrival',
        },
        {
          active: false,
          href: `${baseUrl}induction`,
          text: 'Induction',
        },
        {
          active: false,
          href: `${baseUrl}reviews`,
          text: 'Reviews',
        },
      ])
    })
  })

  describe('renderPlacementSection', () => {
    it('Should render the placement section template', () => {
      const mockHtml = '<div>Placement details content</div>'
      jest.spyOn(nunjucks, 'render').mockImplementation(() => mockHtml)

      const result = renderPlacementSection('placement-details')

      expect(nunjucks.render).toHaveBeenCalledWith('manage/resident/tabs/placement-sections/placement-details.njk')
      expect(result).toBeInstanceOf(nunjucks.runtime.SafeString)
      expect(result.toString()).toEqual(mockHtml)
    })
  })
})
