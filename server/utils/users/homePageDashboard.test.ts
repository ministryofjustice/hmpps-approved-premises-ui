import { userDetailsFactory } from '../../testutils/factories'
import { hasPermission, hasRole, sections, sectionsForUser } from './homePageDashboard'

describe('homePageDashboard', () => {
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

  describe('sectionsForUser', () => {
    it('should return Apply for a user with no roles', () => {
      const user = userDetailsFactory.build({ roles: [] })

      expect(sectionsForUser(user)).toEqual([sections.apply])
    })

    it('should return Apply and Assess sections for a user with cas1 view assigned assessments permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_assigned_assessments'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.assess])
    })

    it('should return Apply section for a user with the manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })

      expect(sectionsForUser(user)).toContain(sections.apply)
    })

    it('should return v1 Manage section for a user with the manager role and no future_manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })

      expect(sectionsForUser(user)).toContain(sections.manage)
    })

    it('should return V2 Manage section for a user with the future_manager role', () => {
      const user = userDetailsFactory.build({ roles: ['future_manager'] })

      expect(sectionsForUser(user)).toContain(sections.v2Manage)
    })

    it('should return ONLY the v2 Manage section for a user with BOTH manager role and the future_manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager', 'future_manager'] })

      expect(sectionsForUser(user)).toContain(sections.v2Manage)
      expect(sectionsForUser(user)).not.toContain(sections.manage)
    })

    it('should return Apply, Workflow, CRU dashboard sections for a user with a workflow manager role', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      expect(sectionsForUser(user)).toContain(sections.apply)
      expect(sectionsForUser(user)).toContain(sections.workflow)
      expect(sectionsForUser(user)).toContain(sections.cruDashboard)
    })

    it('should return Apply sections for a user with a matcher role', () => {
      const user = userDetailsFactory.build({ roles: ['matcher'] })

      expect(sectionsForUser(user)).toEqual([sections.apply])
    })

    it('should return all except match sections for a user with all roles and user permissions', () => {
      const user = userDetailsFactory.build({
        roles: ['assessor', 'manager', 'matcher', 'workflow_manager', 'report_viewer'],
        permissions: ['cas1_view_assigned_assessments'],
      })

      expect(sectionsForUser(user)).toEqual([
        sections.apply,
        sections.assess,
        sections.manage,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
      ])
    })

    it('should return the user management section for a user with a role admin role', () => {
      const user = userDetailsFactory.build({ roles: ['role_admin'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.userManagement])
    })

    it('should return the out of service beds section for a user with a CRU Member role', () => {
      const user = userDetailsFactory.build({ roles: ['cru_member'] })

      expect(sectionsForUser(user)).toEqual(expect.arrayContaining([sections.outOfServiceBeds]))
    })

    it('should not return duplicates where multiple roles contain the same sections', () => {
      const user = userDetailsFactory.build({ roles: ['role_admin', 'workflow_manager'] })
      const uniqueSections = new Set(sectionsForUser(user))

      expect(sectionsForUser(user)).toEqual(Array.from(uniqueSections))
    })
  })
})
