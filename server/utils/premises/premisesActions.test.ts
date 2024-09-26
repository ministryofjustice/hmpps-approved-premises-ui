import { premisesFactory } from '../../testutils/factories'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import userDetails from '../../testutils/factories/userDetails'

describe('premisesActions', () => {
  describe('for users with the role "workflow_manager"', () => {
    const user = userDetails.build({ roles: ['workflow_manager'], permissions: ['cas1_adhoc_booking_create'] })
    const premises = premisesFactory.build()

    it('does NOT include the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })

    it('does NOT include the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    describe('if the user doesnt have the future_manager role', () => {
      it('includes the CREATE PLACEMENT action', () => {
        expect(premisesActions(user, premises)).toContainAction({
          text: 'Create a placement',
          classes: 'govuk-button--secondary',
          href: paths.bookings.new({ premisesId: premises.id }),
        })
      })
    })

    describe('if the user does have the future_manager role', () => {
      it('does not include the CREATE PLACEMENT action', () => {
        expect(
          premisesActions(userDetails.build({ roles: ['workflow_manager', 'future_manager'] }), premises),
        ).not.toContainAction({
          text: 'Create a placement',
          classes: 'govuk-button--secondary',
          href: paths.bookings.new({ premisesId: premises.id }),
        })
      })
    })

    it('includes the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })
  })

  describe('for users with the role "legacy_manager"', () => {
    const user = userDetails.build({ roles: ['legacy_manager'] })
    const premises = premisesFactory.build()

    it('does NOT include the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })

    it('includes the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('does NOT include the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    it('does NOT include the CREATE PLACEMENT action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'Create a placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.new({ premisesId: premises.id }),
      })
    })
  })

  describe('for users with the role "manager"', () => {
    const user = userDetails.build({ roles: ['manager'] })
    const premises = premisesFactory.build()

    it('does NOT include the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })

    it('does include the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('includes the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    it('does NOT include the CREATE PLACEMENT action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
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
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('does NOT include the VIEW CALENDAR action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'View calendar',
        classes: 'govuk-button--secondary',
        href: paths.premises.calendar({ premisesId: premises.id }),
      })
    })

    it('does NOT include the CREATE PLACEMENT action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'Create a placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.new({ premisesId: premises.id }),
      })
    })

    it('includes the "out of service beds" action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })
  })

  describe('for users with no role', () => {
    const user = userDetails.build({ roles: [] })
    const premises = premisesFactory.build()

    it('does NOT include the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })

    it('includes the "manage beds" action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })
  })
})
