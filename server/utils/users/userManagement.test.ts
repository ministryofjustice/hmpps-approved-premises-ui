import { cruManagementAreaFactory, userFactory } from '../../testutils/factories'
import {
  userCruManagementAreasSelectOptions,
  userQualificationsSelectOptions,
  userRolesSelectOptions,
  userSummaryListItems,
} from './userManagement'

describe('UserUtils', () => {
  it('returns the correct objects in an array when all the expected data is present', () => {
    const user = userFactory.build()

    expect(userSummaryListItems(user)).toEqual([
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
          text: user.email,
        },
      },
      {
        key: {
          text: 'Phone number',
        },
        value: {
          text: user.telephoneNumber,
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
    ])
  })

  it('returns the correct objects in an array when all the email and phone number is missing', () => {
    const user = userFactory.build({ email: undefined, telephoneNumber: undefined })

    expect(userSummaryListItems(user)).toEqual([
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
          text: 'No email address available',
        },
      },
      {
        key: {
          text: 'Phone number',
        },
        value: {
          text: 'No phone number available',
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
    ])
  })
})

describe('userRolesSelectOptions', () => {
  it('should return select options for tiers with the all tiers option selected by default', () => {
    expect(userRolesSelectOptions(null)).toEqual([
      { selected: true, text: 'All roles', value: '' },
      { selected: false, text: 'Assessor', value: 'assessor' },
      { selected: false, text: 'CRU member', value: 'cru_member' },
      { selected: false, text: 'Report viewer', value: 'report_viewer' },
      { selected: false, text: 'Report viewer with PII', value: 'report_viewer_with_pii' },
      { selected: false, text: 'Excluded from assess allocation', value: 'excluded_from_assess_allocation' },
      { selected: false, text: 'Excluded from match allocation', value: 'excluded_from_match_allocation' },
      {
        selected: false,
        text: 'Excluded from placement application allocation',
        value: 'excluded_from_placement_application_allocation',
      },
      {
        selected: false,
        text: 'Appeals manager',
        value: 'appeals_manager',
      },
      {
        selected: false,
        text: 'Future manager',
        value: 'future_manager',
      },
      {
        selected: false,
        text: 'AP area manager',
        value: 'ap_area_manager',
      },
      { selected: false, text: 'User manager', value: 'user_manager' },
      { selected: false, text: 'Change request development', value: 'change_request_dev' },
      {
        selected: false,
        text: 'Janitor',
        value: 'janitor',
      },
    ])
  })

  it('should return the selected status if provided', () => {
    expect(userRolesSelectOptions('assessor')).toEqual([
      { selected: false, text: 'All roles', value: '' },
      { selected: true, text: 'Assessor', value: 'assessor' },
      { selected: false, text: 'CRU member', value: 'cru_member' },
      { selected: false, text: 'Report viewer', value: 'report_viewer' },
      { selected: false, text: 'Report viewer with PII', value: 'report_viewer_with_pii' },
      { selected: false, text: 'Excluded from assess allocation', value: 'excluded_from_assess_allocation' },
      { selected: false, text: 'Excluded from match allocation', value: 'excluded_from_match_allocation' },
      {
        selected: false,
        text: 'Excluded from placement application allocation',
        value: 'excluded_from_placement_application_allocation',
      },
      { selected: false, text: 'Appeals manager', value: 'appeals_manager' },
      { selected: false, text: 'Future manager', value: 'future_manager' },
      { selected: false, text: 'AP area manager', value: 'ap_area_manager' },
      { selected: false, text: 'User manager', value: 'user_manager' },
      { selected: false, text: 'Change request development', value: 'change_request_dev' },
      { selected: false, text: 'Janitor', value: 'janitor' },
    ])
  })
})

describe('userQualificationsSelectOptions', () => {
  it('should return select options for tiers with the all tiers option selected by default', () => {
    expect(userQualificationsSelectOptions(null)).toEqual([
      { selected: true, text: 'All qualifications', value: '' },
      { selected: false, text: 'Limited access offenders', value: 'lao' },
      { selected: false, text: 'Emergency APs', value: 'emergency' },
      { selected: false, text: 'ESAP', value: 'esap' },
      { selected: false, text: 'PIPE', value: 'pipe' },
      { selected: false, text: 'Recovery-focused APs', value: 'recovery_focused' },
      { selected: false, text: 'Specialist Mental Health APs', value: 'mental_health_specialist' },
    ])
  })

  it('should return the selected status if provided', () => {
    expect(userQualificationsSelectOptions('lao')).toEqual([
      { selected: false, text: 'All qualifications', value: '' },
      { selected: true, text: 'Limited access offenders', value: 'lao' },
      { selected: false, text: 'Emergency APs', value: 'emergency' },
      { selected: false, text: 'ESAP', value: 'esap' },
      { selected: false, text: 'PIPE', value: 'pipe' },
      { selected: false, text: 'Recovery-focused APs', value: 'recovery_focused' },
      { selected: false, text: 'Specialist Mental Health APs', value: 'mental_health_specialist' },
    ])
  })
})

describe('userCruManagementAreasSelectOptions', () => {
  const cruManagementAreas = cruManagementAreaFactory.buildList(2)

  it('returns a list of CRU management areas', () => {
    expect(userCruManagementAreasSelectOptions(cruManagementAreas)).toEqual([
      {
        text: 'None',
        value: '',
        selected: true,
      },
      {
        text: cruManagementAreas[0].name,
        value: cruManagementAreas[0].id,
        selected: false,
      },
      {
        text: cruManagementAreas[1].name,
        value: cruManagementAreas[1].id,
        selected: false,
      },
    ])
  })

  it('returns a list of CRU management areas with one selected', () => {
    expect(userCruManagementAreasSelectOptions(cruManagementAreas, cruManagementAreas[1].id)).toEqual([
      {
        text: 'None',
        value: '',
        selected: false,
      },
      {
        text: cruManagementAreas[0].name,
        value: cruManagementAreas[0].id,
        selected: false,
      },
      {
        text: cruManagementAreas[1].name,
        value: cruManagementAreas[1].id,
        selected: true,
      },
    ])
  })
})
