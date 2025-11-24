import {
  ApprovedPremisesUserPermission as UserPermission,
  ApprovedPremisesUserRole as UserRole,
  UserQualification,
} from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import rolesToPermissions from './data/rolesToPermissions.json'

export const roles: ReadonlyArray<RoleInUse> = [
  'assessor',
  'cru_member',
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
  'appeals_manager',
  'report_viewer',
  'report_viewer_with_pii',
  'future_manager',
  'ap_area_manager',
  'user_manager',
  'change_request_dev',
  'janitor',
]

export const unusedRoles = [
  'applicant',
  'manager',
  'legacy_manager',
  'role_admin',
  'matcher',
  'workflow_manager',
  'cru_member_find_and_book_beta',
  'cru_member_enable_out_of_service_beds',
] as const

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
  appeals_manager: {
    label: 'Appeals manager',
    hint: 'Log appeals against rejected applications',
  },
  cru_member: {
    label: 'CRU member',
    hint: 'Assign to CRU Members who are not in the Find and Book Beta.',
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
  ap_area_manager: {
    label: 'AP area manager',
    hint: 'Can access task allocation information, but cannot allocate tasks',
  },
  user_manager: {
    label: 'User manager',
    hint: 'Add, update and disable users',
  },
  change_request_dev: {
    label: 'Change request development',
    hint: 'For digital team use only',
  },
  manage_resident: {
    label: 'Manage AP residents development',
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

type RoleToPermissionMapping = {
  name: UserRole
  permissions: Array<UserPermission>
}

export const permissionsMap = rolesToPermissions as Array<RoleToPermissionMapping>

export const roleToPermissions = (role: UserRole) =>
  permissionsMap.find(mapping => mapping.name === role)?.permissions || []

export const hasRole = (user: UserDetails, role: UserRole): boolean => {
  return (user.roles || []).includes(role)
}

export const hasPermission = (user: UserDetails, requiredPermissions: Array<UserPermission>): boolean => {
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
