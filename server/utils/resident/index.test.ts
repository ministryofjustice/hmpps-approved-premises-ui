import { residentTabItems } from './index'
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
          text: 'Personal',
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
})
