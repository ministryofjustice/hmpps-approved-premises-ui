import { hasManagerRole } from '.'
import { userDetailsFactory } from '../../testutils/factories'
import { managerRoles } from './homePageDashboard'

describe('hasManagerRole', () => {
  it.each(managerRoles)('returns true if the user has the role %s', role => {
    expect(hasManagerRole(userDetailsFactory.build({ roles: [role] }))).toBe(true)
  })
})
