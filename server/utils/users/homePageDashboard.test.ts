import { userDetailsFactory } from '../../testutils/factories'
import { hasRole, managerRoles, sections, sectionsForUser } from './homePageDashboard'

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

  describe('sectionsForUser', () => {
    it('should return Apply for a user with no roles', () => {
      const user = userDetailsFactory.build({ roles: [] })

      expect(sectionsForUser(user)).toEqual([sections.apply])
    })

    it('should return Apply and Assess sections for a user with an assessor role', () => {
      const user = userDetailsFactory.build({ roles: ['assessor'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.assess])
    })

    it.each(managerRoles)('should return Apply and Manage sections for a user with a %s role', managerRole => {
      const user = userDetailsFactory.build({ roles: [managerRole] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.manage])
    })

    it('should return Apply, Workflow, Placement Request and CRU dashboard sections for a user with a workflow manager role', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      expect(sectionsForUser(user)).toEqual([
        sections.apply,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
        sections.userManagement,
      ])
    })

    it('should return Apply sections for a user with a matcher role', () => {
      const user = userDetailsFactory.build({ roles: ['matcher'] })

      expect(sectionsForUser(user)).toEqual([sections.apply])
    })

    it('should return all except match sections for a user with all roles', () => {
      const user = userDetailsFactory.build({
        roles: ['assessor', 'manager', 'matcher', 'workflow_manager', 'report_viewer'],
      })

      expect(sectionsForUser(user)).toEqual([
        sections.apply,
        sections.assess,
        sections.manage,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
        sections.userManagement,
      ])
    })

    it('should return the user management section for a user with a role admin role', () => {
      const user = userDetailsFactory.build({ roles: ['role_admin'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.userManagement])
    })

    it('should not return duplicates where multiple roles contain the same sections', () => {
      const user = userDetailsFactory.build({ roles: ['role_admin', 'workflow_manager'] })

      expect(sectionsForUser(user)).toEqual([
        sections.apply,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
        sections.userManagement,
      ])
    })
  })
})
