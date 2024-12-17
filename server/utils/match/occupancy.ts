import { Cas1PremiseCapacityForDay, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { SelectOption } from '@approved-premises/ui'

export const dayAvailabilityCount = (
  dayCapacity: Cas1PremiseCapacityForDay,
  criteria: Array<Cas1SpaceBookingCharacteristic> = [],
) => {
  return criteria.length
    ? Math.min(
        ...dayCapacity.characteristicAvailability
          .filter(availability => criteria.includes(availability.characteristic as Cas1SpaceBookingCharacteristic))
          .map(availability => availability.availableBedsCount - availability.bookingsCount),
      )
    : dayCapacity.availableBedCount - dayCapacity.bookingCount
}

const durationOptionsMap: Record<number, string> = {
  '7': 'Up to 1 week',
  '42': 'Up to 6 weeks',
  '84': 'Up to 12 weeks',
  '182': 'Up to 26 weeks',
  '364': 'Up to 52 weeks',
}

export const durationSelectOptions = (duration?: number): Array<SelectOption> => {
  let selected: string

  if (duration) {
    const values = Object.keys(durationOptionsMap)
    selected = String(values.filter(value => Number(value) >= duration)[0] || values.slice(-1))
  }

  return Object.entries(durationOptionsMap).map(([value, label]) => ({
    value,
    text: label,
    selected: selected === value || undefined,
  }))
}

export const occupancyCriteriaMap: Record<Cas1SpaceBookingCharacteristic, string> = {
  isWheelchairDesignated: 'Wheelchair accessible',
  isSingle: 'Single room',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSuitedForSexOffenders: 'Suitable for sex offenders',
  isArsonSuitable: 'Designated arson room',
}
