import {
  FullPerson,
  Person,
  PersonSummary,
  RestrictedPerson,
  RestrictedPersonSummary,
  UnknownPerson,
  UnknownPersonSummary,
} from '../@types/shared'

const tierBadge = (tier: string): string => {
  if (!tier) return ''

  const colour = { A: 'moj-badge--red', B: 'moj-badge--purple' }[tier[0]]

  return `<span class="moj-badge ${colour}">${tier}</span>`
}

const isApplicableTier = (sex: string, tier: string): boolean => {
  const applicableTiersAll = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']
  const applicableTiersWomen = ['C3']

  const applicableTiers = sex === 'Female' ? [applicableTiersAll, applicableTiersWomen].flat() : applicableTiersAll

  return applicableTiers.includes(tier)
}

const isFullPerson = (person?: Person): person is FullPerson => (person as FullPerson)?.type === 'FullPerson'

const isUnknownPerson = (person?: Person): person is Person => person?.type === 'UnknownPerson'

const fullPersonName = (person: FullPerson, laoAsSuffix = false) => {
  if (person.isRestricted) {
    return laoAsSuffix ? `${person.name} (Limited access offender)` : `LAO: ${person.name}`
  }
  return person.name
}

const restrictedPersonName = (person: RestrictedPerson | RestrictedPersonSummary, showCrn = false) =>
  showCrn ? `LAO: ${person.crn}` : 'Limited Access Offender'

const unknownPersonName = (person: UnknownPerson | UnknownPersonSummary, showCrn = false) =>
  showCrn ? `Unknown: ${person.crn}` : 'Unknown person'

/**
 * Returns the person's name if they are a Full Person, 'Limited Access Offender' if they are a Restricted
 * Person, or 'Unknown person' if they are an Unknown Person. This handles 'summary' types.
 * @param {Person}    person The person whose name needs to be displayed
 * @param options
 * @param {boolean}   options.showCrn Whether to show the CRN when the person name cannot be shown
 * @param {boolean}   options.lasoAsSuffix Shows a full person with the LAO mark as a suffix instead of prefix
 * @returns {string}  The name or text to display
 */
const displayName = (
  person: Person | PersonSummary,
  options: { showCrn?: boolean; laoAsSuffix?: boolean } = { showCrn: false, laoAsSuffix: false },
): string => {
  let typeKey: 'type' | 'personType'

  if ('type' in person) {
    typeKey = 'type'
  } else if ('personType' in person) {
    typeKey = 'personType'
  }

  switch (person[typeKey]) {
    case 'FullPerson':
    case 'FullPersonSummary':
      return fullPersonName(person as FullPerson, options.laoAsSuffix)
    case 'RestrictedPerson':
    case 'RestrictedPersonSummary':
      return restrictedPersonName(person, options.showCrn)
    default:
      return unknownPersonName(person, options.showCrn)
  }
}

export { tierBadge, isApplicableTier, isFullPerson, displayName, isUnknownPerson }
