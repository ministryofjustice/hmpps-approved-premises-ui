import { personalSideNavigation } from './personalUtils'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

describe('personalUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

  describe('personalSideNavigation', () => {
    it('should return the side navigation for the personal tab', () => {
      const basePath = `/manage/resident/${crn}/placement/${placement.id}/personal/`
      expect(personalSideNavigation('personalDetails', crn, placement.id)).toEqual([
        {
          active: true,
          href: `${basePath}personalDetails`,
          text: 'Personal details',
        },
        {
          active: false,
          href: `${basePath}contacts`,
          text: 'Contacts',
        },
      ])
    })
  })
})
