import { ApprovedPremisesUserRole } from '@approved-premises/api'
import { filterAllocationRoles, hasPermission, hasRole, roleToPermissions } from './roles'
import { userDetailsFactory } from '../../testutils/factories'

describe('roles utilities', () => {
  describe('roleToPermissions', () => {
    it('returns an array of permissions for the given role', () => {
      expect(roleToPermissions('user_manager')).toEqual(['cas1_user_list', 'cas1_user_management'])
      expect(roleToPermissions('assessor')).toEqual([
        'cas1_assess_appealed_application',
        'cas1_assess_application',
        'cas1_assess_placement_application',
        'cas1_offline_application_view',
        'cas1_view_assigned_assessments',
      ])
    })

    it('returns an empty array for a role that does not have a mapping', () => {
      expect(roleToPermissions('not_a_role' as ApprovedPremisesUserRole)).toEqual([])
    })
  })

  describe('hasRole', () => {
    it('returns true when the user has the role', () => {
      const user = userDetailsFactory.build({ roles: ['applicant'] })

      expect(hasRole(user, 'applicant')).toEqual(true)
    })

    it('returns false when the user does not have the role', () => {
      const user = userDetailsFactory.build({ roles: ['assessor'] })

      expect(hasRole(user, 'applicant')).toEqual(false)
    })
  })

  describe('hasPermission', () => {
    it('returns true when the user has the permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_assigned_assessments'] })

      expect(hasPermission(user, ['cas1_view_assigned_assessments'])).toEqual(true)
    })

    it('returns false when the user does not have the permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_assigned_assessments'] })

      expect(hasPermission(user, ['cas1_process_an_appeal'])).toEqual(false)
    })
  })

  describe('filterAllocationRoles', () => {
    it('when passed returnOnlyAllocationRoles = true filters out the allocation preferences', () => {
      expect(
        filterAllocationRoles(
          [
            'assessor',
            'appeals_manager',
            'janitor',
            'excluded_from_assess_allocation',
            'excluded_from_match_allocation',
            'excluded_from_placement_application_allocation',
          ],
          { returnOnlyAllocationRoles: false },
        ),
      ).toEqual(['assessor', 'appeals_manager', 'janitor'])
    })

    it('when passed returnOnlyAllocationRoles = false filters out the non-allocation preferences roles', () => {
      expect(
        filterAllocationRoles(
          [
            'assessor',
            'appeals_manager',
            'janitor',
            'excluded_from_assess_allocation',
            'excluded_from_match_allocation',
            'excluded_from_placement_application_allocation',
          ],
          { returnOnlyAllocationRoles: true },
        ),
      ).toEqual([
        'excluded_from_assess_allocation',
        'excluded_from_match_allocation',
        'excluded_from_placement_application_allocation',
      ])
    })
  })
})
