import { userDetailsFactory } from '../testutils/factories'
import { hasRole, sections, sectionsForUser } from './userUtils'

describe('userUtils', () => {
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

    it('should return Apply and Manage sections for a user with a manager role', () => {
      const user = userDetailsFactory.build({ roles: ['manager'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.manage])
    })

    it('should return Apply and Workflow sections for a user with a workflow manager role', () => {
      const user = userDetailsFactory.build({ roles: ['workflow_manager'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.workflow])
    })

    it('should return Apply and Match sections for a user with a matcher role', () => {
      const user = userDetailsFactory.build({ roles: ['matcher'] })

      expect(sectionsForUser(user)).toEqual([sections.apply, sections.match])
    })

    it('should return all sections for a user with all roles', () => {
      const user = userDetailsFactory.build({ roles: ['assessor', 'manager', 'matcher', 'workflow_manager'] })

      expect(sectionsForUser(user)).toEqual(Object.values(sections))
    })
  })
})
