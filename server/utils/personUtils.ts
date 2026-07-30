import config from '../config'
import {
  FullPerson,
  FullPersonSummary,
  Person,
  PersonSummary,
  RestrictedPerson,
  RestrictedPersonSummary,
  RiskTier,
  TierDto,
  UnknownPerson,
  UnknownPersonSummary,
} from '../@types/shared'
import config from '../config'

const tierBadge = (tier: string): string => {
  if (!tier) return ''

  const colour = { A: 'moj-badge--red', B: 'moj-badge--purple' }[tier[0]]

  return `<span class="moj-badge ${colour}">${tier}</span>`
}

const tierBadgeV3 = (tier: string): string => {
  if (!tier) return ''

  return `<span class="moj-badge">${tier}</span>`
}

const versionedTierBadge = (tier: TierDto): string => {
  if (tier.version === 'V2') {
    return tierBadge(tier.tierScore)
  }
  return tierBadgeV3(tier.tierScore)
}

const getVersionedTier = (person: Person | PersonSummary, tierOnApplicationCreation?: RiskTier): string => {
  if (!config.flags.useLiveTiers) {
    return tierOnApplicationCreation?.level || ''
  }
  return personTier(person)?.tierScore || ''
}

const isApplicableTierDto = (person: FullPerson) => {
  const { version, tierScore } = person.tier || {}

  if (version === 'V2') {
    return isApplicableTier(person.sex, tierScore)
  }
  return ['A', 'B', 'C'].includes(tierScore)
}

const isApplicableTier = (sex: string, tier: string): boolean => {
  const applicableTiersAll = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']
  const applicableTiersWomen = ['C3']

  const applicableTiers = sex === 'Female' ? [applicableTiersAll, applicableTiersWomen].flat() : applicableTiersAll

  return applicableTiers.includes(tier)
}

export type PersonAny = Person | PersonSummary

export const isNotRestrictedPerson = (person?: PersonAny): boolean =>
  (person as FullPerson)?.type === 'FullPerson' || (person as FullPersonSummary)?.personType === 'FullPersonSummary'

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
 * @param {boolean}   options.showCrn Show the CRN when the person name cannot be shown (default false)
 * @param {boolean}   options.laoPrefix Prefix person name with 'LAO: ' if restricted (default true)
 * @param {boolean}   options.laoSuffix Append ' (Limited access offender)' to person name if restricted (default false)
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

const personTier = (person: Person | PersonSummary): TierDto => {
  const personType: string = (person as Person).type || (person as PersonSummary).personType

  switch (personType) {
    case 'FullPerson':
    case 'FullPersonSummary':
      return (person as FullPerson).tier
    case 'RestrictedPerson':
    case 'RestrictedPersonSummary':
      return (person as RestrictedPerson).tier
    default:
      return undefined
  }
}

/**
 * @deprecated Use getVersionedTierOrBlank instead
 */
const getTierOrBlank = (tier: string | null | undefined) => (tier ? tierBadge(tier) : '')

const getVersionedTierOrBlank = (person: Person | PersonSummary, tierOnApplicationCreation?: RiskTier) => {
  if (!config.flags.useLiveTiers) {
    return getTierOrBlank(tierOnApplicationCreation?.level)
  }
  const tier = personTier(person)
  return tier ? versionedTierBadge(tier) : ''
}

export {
  tierBadge,
  versionedTierBadge,
  getTierOrBlank,
  getVersionedTierOrBlank,
  isApplicableTier,
  isApplicableTierDto,
  isFullPerson,
  displayName,
  isUnknownPerson,
  personTier,
  getVersionedTier,
}
