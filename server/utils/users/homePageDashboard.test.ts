import { userDetailsFactory } from '../../testutils/factories'
import { sections, sectionsForUser } from './homePageDashboard'

describe('homePageDashboard', () => {
  describe('sectionsForUser', () => {
    const defaultSections = [sections.apply, sections.personalTimeline]

    it('should return the Apply and Timeline sections for a user with no roles or permissions', () => {
      const user = userDetailsFactory.build({ roles: [], permissions: [] })

      expect(sectionsForUser(user)).toEqual(defaultSections)
    })

    it('should return the Assess section for a user with view assigned assessments permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_assigned_assessments'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.assess])
    })

    it('should return the Manage section for a user with the premises view permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_premises_view'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.manage])
    })

    it('should return the Tasks section for a user with cas1 view and manage tasks permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_manage_tasks'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.workflow])
    })

    it('should return the CRU dashboard section for a user with view CRU dashboard permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_cru_dashboard'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.cruDashboard])
    })

    it('should return the Reports section for a user with view reports permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_reports_view'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.reports])
    })

    it('should return the Users section for a user with user management permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_user_management'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.userManagement])
    })

    it('should return the Out of service beds section for a user with the view out of service beds permission', () => {
      const user = userDetailsFactory.build({ permissions: ['cas1_view_out_of_service_beds'] })

      expect(sectionsForUser(user)).toEqual([...defaultSections, sections.outOfServiceBeds])
    })

    it('should return all sections for a user with all permissions', () => {
      const user = userDetailsFactory.build({
        permissions: [
          'cas1_view_assigned_assessments',
          'cas1_view_cru_dashboard',
          'cas1_view_manage_tasks',
          'cas1_premises_view',
          'cas1_reports_view',
          'cas1_user_management',
        ],
      })

      expect(sectionsForUser(user)).toEqual([
        ...defaultSections,
        sections.assess,
        sections.manage,
        sections.workflow,
        sections.cruDashboard,
        sections.reports,
        sections.userManagement,
      ])
    })
  })
})
