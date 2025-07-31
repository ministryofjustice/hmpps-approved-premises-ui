import {
  Cas1CruManagementArea,
  Cas1NationalOccupancy,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceCharacteristic,
} from '@approved-premises/api'
import { SelectGroup } from '@approved-premises/ui'
import { addDays } from 'date-fns'
import { apTypeLongLabels, apTypeShortLabels } from '../apTypeLabels'
import { convertObjectsToSelectOptions } from '../formUtils'
import paths from '../../paths/admin'
import { createQueryString } from '../utils'
import { DateFormats } from '../dateUtils'
import { roomCharacteristicMap, spaceSearchCriteriaApLevelLabels } from '../characteristicsUtils'

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
  roomCriteria: Array<Cas1SpaceCharacteristic>,
): Array<{ summaryRows: Array<string>; apCapacity: Array<{ capacity: string; link: string; classes: string }> }> =>
  capacity.premises.map(premises => ({
    summaryRows: [
      `<a class="govuk-link" href="national-occupancy/premises/${premises.summary.id}">${premises.summary.name}</a>`,
      premises.summary.apArea.code,
      apTypeShortLabels[premises.summary.apType],
      postcode && `${premises.distanceInMiles.toFixed(1)} miles from ${postcode}`,
    ].filter(Boolean),

    apCapacity: premises.capacity.map(({ vacantBedCount, inServiceBedCount, date }) => {
      return {
        capacity: `${vacantBedCount}${roomCriteria?.length ? '' : `/${inServiceBedCount}`}`,
        link: `${paths.admin.nationalOccupancy.premisesDayView({ premisesId: premises.summary.id, date })}${createQueryString(
          { criteria: roomCriteria },
          {
            arrayFormat: 'repeat',
            addQueryPrefix: true,
          },
        )}`,
        classes: vacantBedCount > 0 ? 'govuk-tag--green' : 'govuk-tag--red',
      }
    }),
  }))

export const getPagination = (fromDate: string) => {
  const links = [-7, 7].map(
    days =>
      `${paths.admin.nationalOccupancy.weekView({})}${createQueryString({ fromDate: DateFormats.dateObjToIsoDate(addDays(fromDate, days)) }, { addQueryPrefix: true })}#calendar-heading`,
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
  const ddList = (characteristics: Array<string>) =>
    `<dd>${(characteristics?.length ? characteristics : ['None']).join(',</dd><dd>')}</dd>`

  const roomList = ddList(
    (roomCriteria || []).map(characteristic => roomCharacteristicMap[characteristic as Cas1SpaceBookingCharacteristic]),
  )
  const apList = ddList((apCriteria || []).map(characteristic => spaceSearchCriteriaApLevelLabels[characteristic]))

  return `<dl class="details-list">${apCriteria !== undefined ? `<dt>AP criteria:</dt>${apList}` : ''}<dt>Room criteria:</dt>${roomList}</dl>`
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
