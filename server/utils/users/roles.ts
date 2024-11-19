import {
  ApprovedPremisesUserPermission,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'
import { UserDetails } from '../../@types/ui'

export const roles: ReadonlyArray<RoleInUse> = [
  'assessor',
  'matcher',
  'workflow_manager',
  'cru_member',
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
  'appeals_manager',
  'report_viewer',
  'future_manager',
  'user_manager',
  'janitor',
]

export const unusedRoles = [
  'applicant',
  'manager',
  'legacy_manager',
  'role_admin',
  'cru_member_find_and_book_beta',
] as const

type UnusedRole = (typeof unusedRoles)[number]

export const allocationRoles = [
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
] as const

export type AllocationRole = (typeof allocationRoles)[number]

export type RoleInUse = Exclude<UserRole, UnusedRole>

type BaseRole = Exclude<RoleInUse, AllocationRole>

export const managerRoles: ReadonlyArray<UserRole> = ['workflow_manager', 'future_manager'] as const

export const qualifications: ReadonlyArray<UserQualification> = [
  'pipe',
  'emergency',
  'esap',
  'lao',
  'recovery_focused',
  'mental_health_specialist',
]

export type RoleLabel = { label: string; hint?: string }

export type RoleLabelDictionary = { [K in BaseRole]: RoleLabel }

export const roleLabelDictionary: RoleLabelDictionary = {
  assessor: { label: 'Assessor', hint: 'Assess Approved Premises applications' },
  matcher: { label: 'Matcher', hint: 'Match a person to a suitable AP for placement' },
  workflow_manager: {
    label: 'Workflow manager',
    hint: 'Manage the allocation of assessments and matches to staff',
  },
  appeals_manager: {
    label: 'Appeals manager',
    hint: 'Log appeals against rejected applications',
  },
  cru_member: {
    label: 'CRU member',
    hint: 'Manage out of service beds across all premises and areas',
  },
  report_viewer: {
    label: 'Report Viewer',
    hint: 'View and download reports',
  },
  future_manager: {
    label: 'Future manager',
    hint: 'For digital team use only',
  },
  user_manager: {
    label: 'User manager',
    hint: 'For digital team use only',
  },
  janitor: {
    label: 'Janitor',
    hint: 'For digital team use only',
  },
}

export type AllocationRoleLabelDictionary = { [K in AllocationRole]: RoleLabel }

export const allocationRoleLabelDictionary: AllocationRoleLabelDictionary = {
  excluded_from_assess_allocation: { label: 'Stop assessment allocations' },
  excluded_from_match_allocation: { label: 'Stop match allocations' },
  excluded_from_placement_application_allocation: { label: 'Stop placement request allocations' },
}

type QualificationLabelDictionary = { [K in UserQualification]: string }

export const qualificationDictionary: QualificationLabelDictionary = {
  lao: 'Limited access offenders',
  emergency: 'Emergency APs',
  esap: 'ESAP',
  pipe: 'PIPE',
  recovery_focused: 'Recovery-focused APs',
  mental_health_specialist: 'Specialist Mental Health APs',
}

export const hasRole = (user: UserDetails, role: UserRole): boolean => {
  return (user.roles || []).includes(role)
}

export const hasManagerRole = (user: UserDetails) => managerRoles.some(role => hasRole(user, role))

export const hasPermission = (
  user: UserDetails,
  requiredPermissions: Array<ApprovedPremisesUserPermission>,
): boolean => {
  return (user.permissions || []).filter(userPermission => requiredPermissions.includes(userPermission)).length >= 1
}

const filterUnusedRoles = (allRoles: Array<UserRole>) =>
  allRoles.filter(role => !(unusedRoles as ReadonlyArray<UserRole>).includes(role))

export const filterAllocationRoles = (
  allRoles: Array<UserRole>,
  { returnOnlyAllocationRoles: includeAllocationRoles }: { returnOnlyAllocationRoles: boolean },
) => {
  return filterUnusedRoles(allRoles).filter(
    role => (allocationRoles as ReadonlyArray<UserRole>).includes(role) === includeAllocationRoles,
  )
}
