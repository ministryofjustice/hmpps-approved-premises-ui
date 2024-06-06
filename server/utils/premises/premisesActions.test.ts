import { premisesFactory } from '../../testutils/factories'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import userDetails from '../../testutils/factories/userDetails'

describe('premisesActions', () => {
  describe('for users with the role "workflow_manager"', () => {
    const user = userDetails.build({ roles: ['workflow_manager'] })
    const premises = premisesFactory.build()

    it('includes the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    it('includes the CREATE PLACEMENT action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Create a placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.new({ premisesId: premises.id }),
      })
    })

    it('includes the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })
  })

  describe('for users with the role "legacy_manager"', () => {
    const user = userDetails.build({ roles: ['legacy_manager'] })
    const premises = premisesFactory.build()

    it('includes the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('does NOT include the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    it('does NOT include the CREATE PLACEMENT action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'Create a placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.new({ premisesId: premises.id }),
      })
    })
  })

  describe('for users with the role "future_manager"', () => {
    const user = userDetails.build({ roles: ['future_manager'] })
    const premises = premisesFactory.build()

    it('includes the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('does NOT include the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    it('does NOT include the CREATE PLACEMENT action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'Create a placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.new({ premisesId: premises.id }),
      })
    })
  })
})
