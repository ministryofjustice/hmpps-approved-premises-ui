import { allocationRoleLabelDictionary, filterAllocationRoles, roleCheckboxItem, roleLabelDictionary } from '.'
import { allocationRolesToCheckboxItems, rolesToCheckboxItems } from './rolesToCheckboxItems'

jest.mock('./index.ts')

describe('roleCheckboxUtils', () => {
  describe('rolesToCheckboxItems', () => {
    it('calls filterAllocationRoles with returnOnlyAllocationRoles set to false and returns the results mapped with roleCheckboxItem', () => {
      ;(filterAllocationRoles as jest.MockedFunction<typeof filterAllocationRoles>).mockReturnValue(['assessor'])
      ;(roleCheckboxItem as jest.MockedFunction<typeof roleCheckboxItem>).mockReturnValue({
        text: 'some text',
        value: 'value',
        hint: { text: 'hint' },
        checked: true,
      })

      const result = rolesToCheckboxItems(['assessor', 'future_manager'], ['assessor'])

      expect(filterAllocationRoles).toHaveBeenCalledWith(['assessor', 'future_manager'], {
        returnOnlyAllocationRoles: false,
      })
      expect(roleCheckboxItem).toHaveBeenCalledWith('assessor', roleLabelDictionary, ['assessor'])
      expect(result).toEqual([
        {
          text: 'some text',
          value: 'value',
          hint: { text: 'hint' },
          checked: true,
        },
      ])
    })
  })

  describe('allocationRolesToCheckboxItems', () => {
    it('calls filterAllocationRoles with returnOnlyAllocationRoles set to true and returns the results mapped with roleCheckboxItem', () => {
      ;(filterAllocationRoles as jest.MockedFunction<typeof filterAllocationRoles>).mockReturnValue(['assessor'])
      ;(roleCheckboxItem as jest.MockedFunction<typeof roleCheckboxItem>).mockReturnValue({
        text: 'some text',
        value: 'value',
        hint: { text: 'hint' },
        checked: true,
      })

      const result = allocationRolesToCheckboxItems(['assessor', 'future_manager'], ['assessor'])

      expect(filterAllocationRoles).toHaveBeenCalledWith(['assessor', 'future_manager'], {
        returnOnlyAllocationRoles: true,
      })
      expect(roleCheckboxItem).toHaveBeenCalledWith('assessor', allocationRoleLabelDictionary, ['assessor'])
      expect(result).toEqual([
        {
          text: 'some text',
          value: 'value',
          hint: { text: 'hint' },
          checked: true,
        },
      ])
    })
  })
})
