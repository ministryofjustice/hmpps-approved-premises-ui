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
    const defaultSections = [sections.apply, sections.personalTimeline]
    it('should return Apply and the timeline for a user with no roles', () => {
      const user = userDetailsFactory.build({ roles: [] })

      expect(sectionsForUser(user)).toEqual(defaultSections)
    })

    it('should return Apply and Assess sections for a user with cas1 view assigned assessments permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_assigned_assessments'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.assess])
    })

    it('should return Apply section for a user with the manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })

      expect(sectionsForUser(user)).toContain(sections.apply)
    })

    it('should return v2 Manage section for a user with the manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })

      expect(sectionsForUser(user)).toContain(sections.v2Manage)
    })

    it('should return V2 Manage section for a user with the future_manager role', () => {
      const user = userDetailsFactory.build({ roles: ['future_manager'] })

      expect(sectionsForUser(user)).toContain(sections.v2Manage)
    })

    it('should return v2 Manage section for a user with BOTH manager role and the future_manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager', 'future_manager'] })

      expect(sectionsForUser(user)).toContain(sections.v2Manage)
    })

    it('should return Apply for a user with a workflow manager role', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      expect(sectionsForUser(user)).toContain(sections.apply)
    })

    it('should return Apply sections for a user with a matcher role', () => {
      const user = userDetailsFactory.build({ roles: ['matcher'] })

      expect(sectionsForUser(user)).toEqual(defaultSections)
    })

    it('should return all except match sections for a user with all roles and user permissions', () => {
      const user = userDetailsFactory.build({
        roles: ['assessor', 'manager', 'future_manager', 'matcher', 'workflow_manager', 'report_viewer'],
        permissions: ['cas1_view_assigned_assessments', 'cas1_view_cru_dashboard', 'cas1_view_manage_tasks'],
      })

      expect(sectionsForUser(user)).toEqual([
        ...defaultSections,
        sections.assess,
        sections.v2Manage,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
      ])
    })

    it('should return the user management section for a user with a role admin role', () => {
      const user = userDetailsFactory.build({ roles: ['role_admin'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.userManagement])
    })

    it('should return the cru section for a user with the cas1 view cru dashboard permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_cru_dashboard'] })

      expect(sectionsForUser(user)).toEqual(expect.arrayContaining([sections.cruDashboard]))
    })

    it('should return the out of service beds section for a user with the cas1 view out of service beds permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_out_of_service_beds'] })

      expect(sectionsForUser(user)).toEqual(expect.arrayContaining([sections.outOfServiceBeds]))
    })

    it('should return the workflow section for a user with the cas1 view manage tasks permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_manage_tasks'] })

      expect(sectionsForUser(user)).toEqual(expect.arrayContaining([sections.workflow]))
    })

    it('should not return duplicates where multiple roles contain the same sections', () => {
      const user = userDetailsFactory.build({ roles: ['role_admin', 'workflow_manager'] })
      const uniqueSections = new Set(sectionsForUser(user))

      expect(sectionsForUser(user)).toEqual(Array.from(uniqueSections))
    })
  })
})
