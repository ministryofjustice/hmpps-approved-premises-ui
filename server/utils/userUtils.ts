import { UserRole } from '@approved-premises/api'
import { ServiceSection, UserDetails } from '@approved-premises/ui'

import assessPaths from '../paths/assess'
import applyPaths from '../paths/apply'
import managePaths from '../paths/manage'
import taskPaths from '../paths/tasks'
import matchPaths from '../paths/match'

export const sections = {
  apply: {
    id: 'apply',
    title: 'Apply for an Approved Premises placement',
    description: 'Apply for a placement in an Approved Premises on behalf of a person on probation/in custody.',
    shortTitle: 'Apply',
    href: applyPaths.applications.index({}),
  },
  assess: {
    id: 'assess',
    title: 'Assess Approved Premises applications',
    description: 'Assess applications for placements in an Approved Premises',
    shortTitle: 'Assess',
    href: assessPaths.assessments.index({}),
  },
  manage: {
    id: 'manage',
    title: 'Manage an Approved Premises',
    description: 'Manage occupancy at an Approved Premises',
    shortTitle: 'Manage',
    href: managePaths.premises.index({}),
  },
  workflow: {
    id: 'workflow',
    title: 'Manage workflow tasks',
    description: 'Manage workflow items for Approved Premises tasks',
    shortTitle: 'Workflow',
    href: taskPaths.tasks.index({}),
  },
  match: {
    id: 'match',
    title: 'Match Approved Premises Applications',
    description: 'Match Approved Premises placement requests to a premises',
    shortTitle: 'Match',
    href: matchPaths.placementRequests.index({}),
  },
}

export const hasRole = (user: UserDetails, role: UserRole): boolean => {
  return (user.roles || []).includes(role)
}

export const sectionsForUser = (user: UserDetails): Array<ServiceSection> => {
  const items = [sections.apply]

  if (hasRole(user, 'assessor')) {
    items.push(sections.assess)
  }

  if (hasRole(user, 'manager')) {
    items.push(sections.manage)
  }

  if (hasRole(user, 'workflow_manager')) {
    items.push(sections.workflow)
  }

  if (hasRole(user, 'matcher')) {
    items.push(sections.match)
  }

  return items
}
