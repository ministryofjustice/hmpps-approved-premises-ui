import { premisesFactory } from '../../testutils/factories'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import userDetails from '../../testutils/factories/userDetails'

describe('premisesActions', () => {
  describe('for users with the role "workflow_manager"', () => {
    const user = userDetails.build({ roles: ['workflow_manager'] })

    it('returns all the actions', () => {
      const premises = premisesFactory.build()

      expect(premisesActions(user, premises)).toEqual([
        {
          text: 'View calendar',
          classes: 'govuk-button--secondary',
          href: paths.premises.calendar({ premisesId: premises.id }),
        },
        {
          text: 'Create a placement',
          classes: 'govuk-button--secondary',
          href: paths.bookings.new({ premisesId: premises.id }),
        },
        {
          text: 'Manage beds',
          classes: 'govuk-button--secondary',
          href: paths.premises.beds.index({ premisesId: premises.id }),
        },
      ])
    })
  })

  describe('for users with the role "legacy_manager"', () => {
    const user = userDetails.build({ roles: ['legacy_manager'] })

    it('returns only "Manage beds"', () => {
      const premises = premisesFactory.build()

      expect(premisesActions(user, premises)).toEqual([
        {
          text: 'Manage beds',
          classes: 'govuk-button--secondary',
          href: paths.premises.beds.index({ premisesId: premises.id }),
        },
      ])
    })
  })

  describe('for users with the role "future_manager"', () => {
    const user = userDetails.build({ roles: ['future_manager'] })

    it('returns only "Manage beds"', () => {
      const premises = premisesFactory.build()

      expect(premisesActions(user, premises)).toEqual([
        {
          text: 'Manage beds',
          classes: 'govuk-button--secondary',
          href: paths.premises.beds.index({ premisesId: premises.id }),
        },
      ])
    })
  })
})
