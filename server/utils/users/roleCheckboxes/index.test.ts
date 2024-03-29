import { RoleLabelDictionary, filterAllocationRoles, roleCheckboxItem, userQualificationsToCheckboxItems } from '.'

describe('roleCheckboxUtils', () => {
  describe('filterAllocationRoles', () => {
    it('when passed returnOnlyAllocationRoles = true filters out the allocation preferences', () => {
      expect(
        filterAllocationRoles(
          [
            'assessor',
            'matcher',
            'manager',
            'excluded_from_assess_allocation',
            'excluded_from_match_allocation',
            'excluded_from_placement_application_allocation',
          ],
          { returnOnlyAllocationRoles: false },
        ),
      ).toEqual(['assessor', 'matcher', 'manager'])
    })

    it('when passed returnOnlyAllocationRoles = false filters out the non-allocation preferences roles', () => {
      expect(
        filterAllocationRoles(
          [
            'assessor',
            'matcher',
            'manager',
            'excluded_from_assess_allocation',
            'excluded_from_match_allocation',
            'excluded_from_placement_application_allocation',
          ],
          { returnOnlyAllocationRoles: true },
        ),
      ).toEqual([
        'excluded_from_assess_allocation',
        'excluded_from_match_allocation',
        'excluded_from_placement_application_allocation',
      ])
    })
  })

  describe('roleCheckboxItem', () => {
    it('returns a checkbox object without a hint ', () => {
      expect(
        roleCheckboxItem('manager', { manager: { label: 'test label' } } as RoleLabelDictionary, ['manager']),
      ).toEqual({
        checked: true,
        text: 'test label',
        value: 'manager',
      })
    })

    it('returns a checkbox object with a hint', () => {
      expect(
        roleCheckboxItem('manager', { manager: { label: 'test label', hint: 'test hint' } } as RoleLabelDictionary, [
          'manager',
        ]),
      ).toEqual({
        checked: true,
        text: 'test label',
        value: 'manager',
        hint: { text: 'test hint' },
      })
    })
  })

  describe('userQualificationsToCheckboxItems', () => {
    it('returns the qualifications mapped into CheckBoxItems', () => {
      expect(userQualificationsToCheckboxItems(['pipe', 'emergency', 'esap'], ['pipe'])).toEqual([
        { value: 'pipe', text: 'PIPE', checked: true },
        { value: 'emergency', text: 'Emergency APs', checked: false },
        { value: 'esap', text: 'ESAP', checked: false },
      ])
    })
  })
})
