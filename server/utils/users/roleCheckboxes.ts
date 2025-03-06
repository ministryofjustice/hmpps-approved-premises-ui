import { UserQualification, ApprovedPremisesUserRole as UserRole } from '@approved-premises/api'
import { CheckBoxItem } from '@approved-premises/ui'
import {
  AllocationRoleLabelDictionary,
  BaseRole,
  RoleLabel,
  RoleLabelDictionary,
  allocationRoleLabelDictionary,
  filterAllocationRoles,
  qualificationDictionary,
  roleLabelDictionary,
} from './roles'

export const roleCheckboxItem = (
  role: UserRole,
  dictionary: RoleLabelDictionary | AllocationRoleLabelDictionary,
  selectedRoles: Array<UserRole> = [],
): CheckBoxItem => {
  const dictionaryRole: RoleLabel = (dictionary as RoleLabelDictionary)[role as BaseRole]
  const checkbox: CheckBoxItem = {
    value: role,
    text: dictionaryRole.label,
    checked: selectedRoles.includes(role),
  }

  if (dictionaryRole?.hint) checkbox.hint = { text: dictionaryRole.hint }

  return checkbox
}
export const rolesToCheckboxItems = (
  allRoles: Array<UserRole>,
  selectedRoles: Array<UserRole> = [],
): Array<CheckBoxItem> =>
  filterAllocationRoles(allRoles, { returnOnlyAllocationRoles: false }).map(role => {
    return roleCheckboxItem(role, roleLabelDictionary, selectedRoles)
  })

export const allocationRolesToCheckboxItems = (
  allRoles: Array<UserRole>,
  selectedRoles: Array<UserRole> = [],
): Array<CheckBoxItem> => {
  return filterAllocationRoles(allRoles, { returnOnlyAllocationRoles: true }).map(role =>
    roleCheckboxItem(role, allocationRoleLabelDictionary, selectedRoles),
  )
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
