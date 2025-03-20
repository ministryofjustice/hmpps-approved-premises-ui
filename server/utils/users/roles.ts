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
  'cru_member_find_and_book_beta',
  'cru_member_enable_out_of_service_beds',
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
  'appeals_manager',
  'report_viewer',
  'report_viewer_with_pii',
  'future_manager',
  'user_manager',
  'change_request_dev',
  'janitor',
]

export const unusedRoles = ['applicant', 'manager', 'legacy_manager', 'role_admin'] as const

type UnusedRole = (typeof unusedRoles)[number]

export const allocationRoles = [
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
] as const

export type AllocationRole = (typeof allocationRoles)[number]

export type RoleInUse = Exclude<UserRole, UnusedRole>

export type BaseRole = Exclude<RoleInUse, AllocationRole>

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
    hint: 'Assign to CRU Members who are not in the Find and Book Beta. In addition to this role, Workflow manager must also be assigned to CRU members.',
  },
  cru_member_enable_out_of_service_beds: {
    label: 'CRU member - Enable out of service beds',
    hint: "Assign in addition to 'CRU member' or 'CRU member - Find and book beta' to enable access to out of service beds",
  },
  cru_member_find_and_book_beta: {
    label: 'CRU member - Find and book beta',
    hint: 'Assign to CRU Members who are in the Find and Book Beta. In addition to this role, Workflow manager must also be assigned to CRU members.',
  },
  report_viewer: {
    label: 'Report viewer without PII',
    hint: 'View and download reports, excluding those with personally identifiable information',
  },
  report_viewer_with_pii: {
    label: 'Report viewer with PII',
    hint: 'View and download reports, including those with personally identifiable information',
  },
  future_manager: {
    label: 'Future manager',
    hint: 'Provides access to manage and creating out of service beds',
  },
  user_manager: {
    label: 'User manager',
    hint: 'Add, update and disable users',
  },
  change_request_dev: {
    label: 'Change request development',
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
