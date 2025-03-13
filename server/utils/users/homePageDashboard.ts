import { ServiceSection, UserDetails } from '@approved-premises/ui'

import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'
import managePaths from '../../paths/manage'
import taskPaths from '../../paths/tasks'
import adminPaths from '../../paths/admin'
import peoplePaths from '../../paths/people'
import { hasPermission, hasRole } from './roles'

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
  cruDashboard: {
    id: 'cruDashboard',
    title: 'CRU Dashboard',
    description: ' View applications that require matching. Record and update details of Approved Premises placements.',
    shortTitle: 'CRU dashboard',
    href: adminPaths.admin.cruDashboard.index({}),
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
  personalTimeline: {
    id: 'timeline',
    title: "View a person's timeline",
    description: 'View activity about a person, including previous applications, placements, and assessments.',
    shortTitle: 'Timeline',
    href: peoplePaths.timeline.find({}),
  },
  outOfServiceBeds: {
    id: 'outOfServiceBeds',
    title: 'View out of service beds',
    description: 'View all currently out of service beds, across all Approved Premises.',
    shortTitle: 'Out of service beds',
    href: managePaths.outOfServiceBeds.index({ temporality: 'current' }),
  },
}

export const sectionsForUser = (user: UserDetails): Array<ServiceSection> => {
  const items = [sections.apply, sections.personalTimeline]

  if (hasPermission(user, ['cas1_view_assigned_assessments'])) {
    items.push(sections.assess)
  }

  if (hasPermission(user, ['cas1_premises_view'])) {
    items.push(sections.manage)
  }

  if (hasPermission(user, ['cas1_view_manage_tasks'])) {
    items.push(sections.workflow)
  }

  if (hasPermission(user, ['cas1_view_cru_dashboard'])) {
    items.push(sections.cruDashboard)
  }

  if (hasPermission(user, ['cas1_reports_view'])) {
    items.push(sections.reports)
  }

  if (hasPermission(user, ['cas1_user_management'])) {
    items.push(sections.userManagement)
  }

  if (hasPermission(user, ['cas1_view_out_of_service_beds'])) {
    items.push(sections.outOfServiceBeds)
  }

  return Array.from(new Set(items))
}
