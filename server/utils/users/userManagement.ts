import { SelectOption } from '@approved-premises/ui'
import { ApprovedPremisesUserRole, ApprovedPremisesUser as User, UserQualification } from '../../@types/shared'
import { qualificationDictionary } from './roleCheckboxes'

export const userSummaryListItems = (user: User) => [
  {
    key: {
      text: 'Name',
    },
    value: {
      text: user.name,
    },
  },
  {
    key: {
      text: 'Username',
    },
    value: {
      text: user.deliusUsername,
    },
  },
  {
    key: {
      text: 'Email',
    },
    value: {
      text: user?.email ?? 'No email address available',
    },
  },
  {
    key: {
      text: 'Phone number',
    },
    value: {
      text: user?.telephoneNumber ?? 'No phone number available',
    },
  },
  {
    key: {
      text: 'Region',
    },
    value: {
      text: user.region.name,
    },
  },
]

const userRoles: Record<ApprovedPremisesUserRole, string> = {
  assessor: 'Assessor',
  matcher: 'Matcher',
  manager: 'Manager',
  workflow_manager: 'Workflow manager',
  applicant: 'Applicant',
  role_admin: 'Role admin',
  report_viewer: 'Report viewer',
  excluded_from_assess_allocation: 'Excluded from assess allocation',
  excluded_from_match_allocation: 'Excluded from match allocation',
  excluded_from_placement_application_allocation: 'Excluded from placement application allocation',
  appeals_manager: 'Appeals manager',
  legacy_manager: 'Legacy manager',
  future_manager: 'Future manager',
}
export const userRolesSelectOptions = (
  selectedOption: ApprovedPremisesUserRole | undefined | null,
): Array<SelectOption> => {
  const options = Object.keys(userRoles).map(role => ({
    text: userRoles[role],
    value: role,
    selected: role === selectedOption,
  }))

  options.unshift({
    text: 'All roles',
    value: '',
    selected: !selectedOption,
  })

  return options
}

export const userQualificationsSelectOptions = (
  selectedOption: UserQualification | undefined | null,
): Array<SelectOption> => {
  const options = Object.keys(qualificationDictionary).map(qualification => ({
    text: qualificationDictionary[qualification],
    value: qualification,
    selected: qualification === selectedOption,
  }))

  options.unshift({
    text: 'All qualifications',
    value: '',
    selected: !selectedOption,
  })

  return options
}
