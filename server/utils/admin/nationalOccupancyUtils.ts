import { ApType, Cas1CruManagementArea, Cas1NationalOccupancy, Cas1SpaceCharacteristic } from '@approved-premises/api'
import { SelectGroup } from '@approved-premises/ui'
import { addDays } from 'date-fns'
import { apTypeLongLabels, apTypeShortLabels } from '../apTypeLabels'
import { convertObjectsToSelectOptions } from '../formUtils'
import paths from '../../paths/admin'
import { createQueryString, roundNumber } from '../utils'
import { DateFormats } from '../dateUtils'
import { getRoomCharacteristicLabel, spaceSearchCriteriaApLevelLabels } from '../characteristicsUtils'

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

export const expandManagementArea = (cruManagementAreas: Array<Cas1CruManagementArea>, selectedArea: string) => {
  if (selectedArea === 'allWomens')
    return cruManagementAreas.filter(({ id }) => id === CRU_AREA_WOMENS).map(({ id }) => id)
  if (selectedArea === 'allMens')
    return cruManagementAreas.filter(({ id }) => id !== CRU_AREA_WOMENS).map(({ id }) => id)
  return [selectedArea]
}

export const processCapacity = (
  capacity: Cas1NationalOccupancy,
  postcode: string,
  apType: ApType,
): Array<{ summaryRows: Array<string>; apCapacity: Array<{ capacity: string; link: string; classes: string }> }> => {
  return capacity.premises
    .map(premises => {
      const summaryRows = [
        `<a class="govuk-link" href="national-occupancy/premises/${premises.summary.id}">${premises.summary.name}</a>`,
        premises.summary.apArea.code,
        apTypeShortLabels[premises.summary.apType],
        postcode && `${roundNumber(premises.distanceInMiles, 1)} miles from ${postcode}`,
      ].filter(Boolean)
      const apCapacity = premises.capacity.map(({ forRoomCharacteristic, vacantBedCount, inServiceBedCount }) => {
        return {
          capacity: `${vacantBedCount}${forRoomCharacteristic ? '' : `/${inServiceBedCount}`}`,
          link: '#',
          classes: vacantBedCount > 0 ? 'govuk-tag--green' : 'govuk-tag--red',
        }
      })

      return apType === 'normal' || premises.summary.apType === apType
        ? {
            summaryRows,
            apCapacity,
          }
        : undefined
    })
    .filter(Boolean)
}

export const getPagination = (fromDate: string) => {
  const links = [-7, 7].map(
    days =>
      `${paths.admin.nationalOccupancy.weekView({})}${createQueryString({ fromDate: DateFormats.dateObjToIsoDate(addDays(fromDate, days)) }, { addQueryPrefix: true })}`,
  )

  return {
    classes: 'flex_justify_space_between govuk-!-margin-bottom-2',
    previous: {
      text: 'Previous week',
      href: links[0],
    },
    next: {
      text: 'Next week',
      href: links[1],
    },
    items: [] as Array<unknown>,
  }
}

export const getCriteriaBlock = (
  apCriteria: Array<Cas1SpaceCharacteristic>,
  roomCriteria: Array<Cas1SpaceCharacteristic>,
) => {
  const roomList = roomCriteria?.length
    ? roomCriteria.map(characteristic => getRoomCharacteristicLabel(characteristic)).join(', ')
    : 'None'
  const apList = apCriteria?.length
    ? apCriteria.map(characteristic => spaceSearchCriteriaApLevelLabels[characteristic]).join(', ')
    : 'None'
  return `<div class="details-list"><dl><dt>AP criteria:</dt><dd>${apList}</dd></dl>
<dl><dt>Room criteria:</dt><dd>${roomList}</dd></dl></div>`
}

export const getDateHeader = (capacity: Cas1NationalOccupancy): Array<string> => {
  let date: Date = DateFormats.isoToDateObj(capacity.startDate)
  const endDate: Date = DateFormats.isoToDateObj(capacity.endDate)
  const dates: Array<string> = []
  while (date <= endDate) {
    dates.push(DateFormats.dateObjtoUIDate(date, { format: 'longNoYear' }))
    date = addDays(date, 1)
  }
  return dates
}
