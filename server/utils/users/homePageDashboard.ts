import { ApprovedPremisesUserRole as UserRole } from '@approved-premises/api'
import { ServiceSection, UserDetails } from '@approved-premises/ui'

import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'
import managePaths from '../../paths/manage'
import taskPaths from '../../paths/tasks'
import matchPaths from '../../paths/match'
import adminPaths from '../../paths/admin'

export const sections = {
  apply: {
    id: 'apply',
    title: 'Apply for an Approved Premises placement',
    description: 'Apply for an Approved Premises placement on behalf of a person in custody or on probation.',
    shortTitle: 'Apply',
    href: applyPaths.applications.index({}),
  },
  assess: {
    id: 'assess',
    title: 'Assess Approved Premises applications',
    description: 'Assess applications for Approved Premises placements and review requests for placement.',
    shortTitle: 'Assess',
    href: assessPaths.assessments.index({}),
  },
  manage: {
    id: 'manage',
    title: 'Manage an Approved Premises',
    description:
      'Manage arrivals, departures and out of service beds. View current and upcoming occupancy at an Approved Premises.',
    shortTitle: 'Manage',
    href: managePaths.premises.index({}),
  },
  workflow: {
    id: 'workflow',
    title: 'Manage task allocations',
    description: 'Re-allocate assessment and matching tasks to manage staff workloads',
    shortTitle: 'Task allocation',
    href: taskPaths.tasks.index({}),
  },
  match: {
    id: 'match',
    title: 'Match people to Approved Premises placements',
    description: "Allocate cases to suitable Approved Premises based on a person's needs",
    shortTitle: 'Match',
    href: matchPaths.placementRequests.index({}),
  },
  cruDashboard: {
    id: 'cruDashboard',
    title: 'CRU Dashboard',
    description: ' View applications that require matching. Record and update details of Approved Premises placements.',
    shortTitle: 'CRU dashboard',
    href: adminPaths.admin.placementRequests.index({}),
  },
  reports: {
    id: 'reports',
    title: 'Download data',
    description: 'Download data on lost beds and applications',
    shortTitle: 'Reports',
    href: adminPaths.admin.reports.new({}),
  },
  userManagement: {
    id: 'userManagement',
    title: 'Manage user roles',
    description:
      'Manage user roles and permissions. Stop automatic allocations for assessments, matches, and placement requests.',
    shortTitle: 'Users',
    href: adminPaths.admin.userManagement.index({}),
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
    items.push(sections.cruDashboard)
    items.push(sections.reports)
    items.push(sections.userManagement)
  }

  if (hasRole(user, 'role_admin')) {
    items.push(sections.userManagement)
  }

  return Array.from(new Set(items))
}
