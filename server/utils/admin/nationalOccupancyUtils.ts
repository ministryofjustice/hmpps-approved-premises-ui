import { Cas1CruManagementArea } from '@approved-premises/api'
import { SelectGroup } from '@approved-premises/ui'
import { apTypeLongLabels } from '../apTypeLabels'
import { convertObjectsToSelectOptions } from '../formUtils'

export const CRU_AREA_WOMENS = 'bfb04c2a-1954-4512-803d-164f7fcf252c'

export const getManagementAreaSelectGroups = (
  cruManagementAreas: Array<Cas1CruManagementArea>,
  value: string,
  cruManagementArea: string,
) => {
  const selectedValue = value || (cruManagementArea === CRU_AREA_WOMENS ? 'allWomens' : 'allMens')
  const groupWrap = (group: Array<Cas1CruManagementArea>, label: string): SelectGroup => ({
    label,
    items: group.map(({ id, name }) => ({ text: name, value: id, selected: selectedValue === id })),
  })

  return [
    groupWrap(
      [{ id: 'allMens', name: `All areas - Men's` }, ...cruManagementAreas.filter(({ id }) => id !== CRU_AREA_WOMENS)],
      `Men's AP`,
    ),
    groupWrap([{ id: 'allWomens', name: `All areas - Women's` }], `Women's AP`),
  ]
}

export const getApTypeOptions = (apType?: string) => {
  const apTypes = Object.entries(apTypeLongLabels).map(([id, name]) => ({ id, name }))
  return convertObjectsToSelectOptions(apTypes, null, 'name', 'id', 'apType', null, { apType })
}
