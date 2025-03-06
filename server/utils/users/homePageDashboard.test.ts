import { userDetailsFactory } from '../../testutils/factories'
import { sections, sectionsForUser } from './homePageDashboard'

describe('homePageDashboard', () => {
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

    it('should return Manage section for a user with the cas1 premises view permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_premises_view'] })

      expect(sectionsForUser(user)).toContain(sections.manage)
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
        roles: ['assessor', 'future_manager', 'matcher', 'workflow_manager', 'report_viewer'],
        permissions: [
          'cas1_view_assigned_assessments',
          'cas1_view_cru_dashboard',
          'cas1_view_manage_tasks',
          'cas1_premises_view',
        ],
      })

      expect(sectionsForUser(user)).toEqual([
        ...defaultSections,
        sections.assess,
        sections.manage,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
      ])
    })

    it('should return the user management section for a user with a user manager role', () => {
      const user = userDetailsFactory.build({ roles: ['user_manager'] })

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
      const user = userDetailsFactory.build({ roles: ['user_manager', 'workflow_manager'] })
      const uniqueSections = new Set(sectionsForUser(user))

      expect(sectionsForUser(user)).toEqual(Array.from(uniqueSections))
    })
  })
})
