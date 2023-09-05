import { ApprovedPremisesUserRole as UserRole } from '../../../@types/shared'
import { allocationRoleLabelDictionary, filterAllocationRoles, roleCheckboxItem, roleLabelDictionary } from '.'
import { CheckBoxItem } from '../../../@types/ui'

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
