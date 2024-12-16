import {
  allocationRolesToCheckboxItems,
  roleCheckboxItem,
  rolesToCheckboxItems,
  userQualificationsToCheckboxItems,
} from './roleCheckboxes'
import { RoleLabelDictionary } from './roles'

describe('roleCheckboxUtils', () => {
  describe('roleCheckboxItem', () => {
    it('returns a checkbox object without a hint ', () => {
      expect(
        roleCheckboxItem('janitor', { janitor: { label: 'test label' } } as RoleLabelDictionary, ['janitor']),
      ).toEqual({
        checked: true,
        text: 'test label',
        value: 'janitor',
      })
    })

    it('returns a checkbox object with a hint', () => {
      expect(
        roleCheckboxItem('janitor', { janitor: { label: 'test label', hint: 'test hint' } } as RoleLabelDictionary, [
          'janitor',
        ]),
      ).toEqual({
        checked: true,
        text: 'test label',
        value: 'janitor',
        hint: { text: 'test hint' },
      })
    })
  })

  describe('rolesToCheckboxItems', () => {
    it('returns roles checkboxes with current selection', () => {
      const result = rolesToCheckboxItems(['assessor', 'future_manager'], ['assessor'])

      expect(result).toEqual([
        {
          text: 'Assessor',
          value: 'assessor',
          hint: { text: 'Assess Approved Premises applications' },
          checked: true,
        },
        {
          text: 'Future manager',
          value: 'future_manager',
          hint: { text: 'Provides access to manage and creating out of service beds' },
          checked: false,
        },
      ])
    })
  })

  describe('allocationRolesToCheckboxItems', () => {
    it('returns allocation roles checkboxes with current selection', () => {
      const result = allocationRolesToCheckboxItems(
        ['excluded_from_assess_allocation', 'excluded_from_match_allocation'],
        ['excluded_from_match_allocation'],
      )

      expect(result).toEqual([
        {
          text: 'Stop assessment allocations',
          value: 'excluded_from_assess_allocation',
          checked: false,
        },
        {
          text: 'Stop match allocations',
          value: 'excluded_from_match_allocation',
          checked: true,
        },
      ])
    })
  })

  describe('userQualificationsToCheckboxItems', () => {
    it('returns the qualifications mapped into CheckBoxItems', () => {
      const result = userQualificationsToCheckboxItems(['pipe', 'emergency', 'esap'], ['pipe'])

      expect(result).toEqual([
        {
          value: 'pipe',
          text: 'PIPE',
          checked: true,
        },
        {
          value: 'emergency',
          text: 'Emergency APs',
          checked: false,
        },
        {
          value: 'esap',
          text: 'ESAP',
          checked: false,
        },
      ])
    })
  })
})
