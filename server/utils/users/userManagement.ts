import { SelectOption } from '@approved-premises/ui'
import {
  ApprovedPremisesUserRole,
  Cas1CruManagementArea,
  ApprovedPremisesUser as User,
  UserQualification,
} from '../../@types/shared'
import { RoleInUse, qualificationDictionary } from './roles'

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

const userRoles: Record<RoleInUse, string> = {
  assessor: 'Assessor',
  cru_member: 'CRU member',
  report_viewer: 'Report viewer',
  report_viewer_with_pii: 'Report viewer with PII',
  excluded_from_assess_allocation: 'Excluded from assess allocation',
  excluded_from_match_allocation: 'Excluded from match allocation',
  excluded_from_placement_application_allocation: 'Excluded from placement application allocation',
  cru_member_enable_out_of_service_beds: 'CRU member - enable out of service beds',
  cru_member_find_and_book_beta: 'CRU member beta (find and book)',
  appeals_manager: 'Appeals manager',
  future_manager: 'Future manager',
  user_manager: 'User manager',
  change_request_dev: 'Change request development',
  janitor: 'Janitor',
}

export const userRolesSelectOptions = (
  selectedOption: ApprovedPremisesUserRole | undefined | null,
): Array<SelectOption> => {
  const options = Object.entries(userRoles).map(([value, text]) => ({
    text,
    value,
    selected: value === selectedOption,
  }))

  options.unshift({
    text: 'All roles',
    value: '' as RoleInUse,
    selected: !selectedOption,
  })

  return options
}

export const userQualificationsSelectOptions = (
  selectedOption: UserQualification | undefined | null,
): Array<SelectOption> => {
  const options = Object.entries(qualificationDictionary).map(([value, text]) => ({
    text,
    value,
    selected: value === selectedOption,
  }))

  options.unshift({
    text: 'All qualifications',
    value: '' as UserQualification,
    selected: !selectedOption,
  })

  return options
}

export const userCruManagementAreasSelectOptions = (
  cruManagementAreas: Array<Cas1CruManagementArea>,
  selected?: Cas1CruManagementArea['id'],
): Array<SelectOption> => [
  {
    text: 'None',
    value: '',
    selected: !selected,
  },
  ...cruManagementAreas.map(area => ({
    text: area.name,
    value: area.id,
    selected: selected === area.id,
  })),
]
