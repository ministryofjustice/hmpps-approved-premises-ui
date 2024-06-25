import { premisesFactory } from '../../testutils/factories'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import userDetails from '../../testutils/factories/userDetails'

describe('premisesActions', () => {
  describe('for users with the role "workflow_manager"', () => {
    const user = userDetails.build({ roles: ['workflow_manager'] })
    const premises = premisesFactory.build()

    it('does NOT include the v2 OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id }),
      })
    })

    it('does NOT include the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
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

    it('does NOT include the v2 OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id }),
      })
    })

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

  describe('for users with the role "manager"', () => {
    const user = userDetails.build({ roles: ['manager'] })
    const premises = premisesFactory.build()

    it('does NOT include the v2 OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id }),
      })
    })

    it('does include the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('includes the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
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

    it('includes the "v2 out of service beds" action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id }),
      })
    })
  })

  describe('for users with no role', () => {
    const user = userDetails.build({ roles: [] })
    const premises = premisesFactory.build()

    it('does NOT include the v2 OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainManageAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id }),
      })
    })

    it('includes the "manage beds" action', () => {
      expect(premisesActions(user, premises)).toContainManageAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })
  })
})
