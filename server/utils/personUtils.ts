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

const fullPersonName = (
  person: FullPerson,
  options: { laoPrefix?: boolean; laoSuffix?: boolean } = {
    laoPrefix: true,
    laoSuffix: false,
  },
) => {
  if (person.isRestricted) {
    if (options.laoSuffix) {
      return `${person.name} (Limited access offender)`
    }
    if (options.laoPrefix) {
      return `LAO: ${person.name}`
    }
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
 * @param {boolean}   options.showCrn Show the CRN when the person name cannot be shown
 * @param {boolean}   options.laoPrefix Prefix person name with 'LAO: ' if restricted (default true)
 * @param {boolean}   options.laoSuffix Append ' (Limited access offender)' to person name if restricted
 * @returns {string}  The name or text to display
 */
const displayName = (
  person: Person | PersonSummary,
  options: { showCrn?: boolean; laoPrefix?: boolean; laoSuffix?: boolean } = {},
): string => {
  const { showCrn = false, laoPrefix = true, laoSuffix = false } = options

  const personType: string = (person as Person).type || (person as PersonSummary).personType

  switch (personType) {
    case 'FullPerson':
    case 'FullPersonSummary':
      return fullPersonName(person as FullPerson, { laoPrefix, laoSuffix })
    case 'RestrictedPerson':
    case 'RestrictedPersonSummary':
      return restrictedPersonName(person, showCrn)
    default:
      return unknownPersonName(person, showCrn)
  }
}

export { tierBadge, isApplicableTier, isFullPerson, displayName, isUnknownPerson }
