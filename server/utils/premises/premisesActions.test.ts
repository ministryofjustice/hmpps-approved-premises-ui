import { cas1PremisesFactory } from '../../testutils/factories'
import { premisesActions } from './premisesActions'
import paths from '../../paths/manage'
import userDetails from '../../testutils/factories/userDetails'

describe('premisesActions', () => {
  describe('for users with premises view permissions', () => {
    const user = userDetails.build({ permissions: ['cas1_premises_view'] })
    const premises = cas1PremisesFactory.build()

    it('does NOT include the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'View out of service bed records',
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

  describe('for users with view OOSB permission', () => {
    const user = userDetails.build({ permissions: ['cas1_view_out_of_service_beds'] })
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
        text: 'View out of service bed records',
        classes: 'govuk-button--secondary',
        href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
      })
    })
  })

  describe('for users with no permissions', () => {
    const user = userDetails.build({ permissions: [] })
    const premises = cas1PremisesFactory.build()

    it('does NOT include the OUT OF SERVICE BEDS action', () => {
      expect(premisesActions(user, premises)).not.toContainAction({
        text: 'View out of service bed records',
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
