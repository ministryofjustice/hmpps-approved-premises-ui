import { UserQualification, ApprovedPremisesUserRole as UserRole } from '../../../@types/shared'
import { CheckBoxItem } from '../../../@types/ui'

export const roleLabelDictionary: RoleLabelDictionary = {
  role_admin: { label: 'Administrator' },
  assessor: { label: 'Assessor', hint: 'Assess Approved Premises applications' },
  manager: {
    label: 'Manage an Approved Premises (AP)',
    hint: 'Mark arrivals, departures, and manage placements at an AP',
  },
  matcher: { label: 'Matcher', hint: 'Match a person to a suitable AP for placement' },
  workflow_manager: {
    label: 'Workflow manager',
    hint: 'Manage the allocation of assessments and matches to staff, and view reports',
  },
  appeals_manager: {
    label: 'Appeals manager',
    hint: 'Log appeals against rejected applications',
  },
}

export const allocationRoleLabelDictionary: AllocationRoleLabelDictionary = {
  excluded_from_assess_allocation: { label: 'Stop assessment allocations' },
  excluded_from_match_allocation: { label: 'Stop match allocations' },
  excluded_from_placement_application_allocation: { label: 'Stop placement request allocations' },
}

type UnusedRoles = 'applicant' | 'report_viewer'

type RolesForCheckboxes = Exclude<UserRole, AllocationRole | UnusedRoles>

export type RoleLabel = { label: string; hint?: string }

export type RoleLabelDictionary = { [K in RolesForCheckboxes]: RoleLabel }

export type AllocationRoleLabelDictionary = { [K in AllocationRolesForCheckboxes]: RoleLabel }
type AllocationRolesForCheckboxes = Exclude<UserRole, RolesForCheckboxes | UnusedRoles>

export const roles: ReadonlyArray<UserRole> = [
  'role_admin',
  'assessor',
  'manager',
  'matcher',
  'workflow_manager',
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
  'appeals_manager',
]

export const allocationRoles = [
  'excluded_from_assess_allocation',
  'excluded_from_match_allocation',
  'excluded_from_placement_application_allocation',
] as const

export const unusedRoles = ['applicant', 'report_viewer'] as const

export type AllocationRole = (typeof allocationRoles)[number]

export const qualifications: ReadonlyArray<UserQualification> = ['pipe', 'emergency', 'esap', 'lao']

export const qualificationDictionary: Record<UserQualification, string> = {
  lao: 'Limited access offenders',
  womens: "Women's APs",
  emergency: 'Emergency APs',
  esap: 'ESAP',
  pipe: 'PIPE',
}

export const filterUnusedRoles = (allRoles: Array<UserRole>) =>
  allRoles.filter(role => !(unusedRoles as ReadonlyArray<UserRole>).includes(role))

export const filterAllocationRoles = (
  allRoles: Array<UserRole>,
  { returnOnlyAllocationRoles: includeAllocationRoles }: { returnOnlyAllocationRoles: boolean },
) => {
  return filterUnusedRoles(allRoles).filter(
    role => (allocationRoles as ReadonlyArray<UserRole>).includes(role) === includeAllocationRoles,
  )
}

export const roleCheckboxItem = (
  role: UserRole,
  dictionary: RoleLabelDictionary | AllocationRoleLabelDictionary,
  selectedRoles: Array<UserRole> = [],
): CheckBoxItem => {
  const checkbox: CheckBoxItem = {
    value: role,
    text: dictionary[role].label,
    checked: selectedRoles.includes(role),
  }

  if (dictionary[role]?.hint) checkbox.hint = { text: dictionary[role].hint }

  return checkbox
}

export const userQualificationsToCheckboxItems = (
  userQualifications: Array<UserQualification>,
  selectedQualifications: Array<UserQualification> = [],
): Array<CheckBoxItem> => {
  return userQualifications.map(qualification => {
    return {
      value: qualification,
      text: qualificationDictionary[qualification],
      checked: selectedQualifications.includes(qualification),
    }
  })
}
