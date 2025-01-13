import { cas1PremisesFactory } from '../../testutils/factories'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import userDetails from '../../testutils/factories/userDetails'

describe('premisesActions', () => {
  describe('for users with the role "workflow_manager"', () => {
    const user = userDetails.build({ roles: ['workflow_manager'], permissions: ['cas1_adhoc_booking_create'] })
    const premises = cas1PremisesFactory.build()

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
  })

  describe('for users with the role "future_manager"', () => {
    const user = userDetails.build({ roles: ['future_manager'] })
    const premises = cas1PremisesFactory.build()

    it('includes the MANAGE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage beds',
        classes: 'govuk-button--secondary',
        href: paths.premises.beds.index({ premisesId: premises.id }),
      })
    })

    it('includes the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).toContainAction({
        text: 'Manage out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })
  })

  describe('for users with no role', () => {
    const user = userDetails.build({ roles: [] })
    const premises = cas1PremisesFactory.build()

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
  })
})
