import { FullPerson, FullPersonSummary, Person, PersonSummary } from '../@types/shared'

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

const isFullPerson = (person?: Person): person is FullPerson => (person as FullPerson)?.name !== undefined

const isUnknownPerson = (person?: Person): boolean => person?.type === 'UnknownPerson'

const laoName = (person: FullPerson) => (person.isRestricted ? `LAO: ${person.name}` : person.name)

const laoSummaryName = (personSummary: PersonSummary) => {
  if (personSummary.personType === 'FullPersonSummary') {
    const { name, isRestricted } = personSummary as FullPersonSummary
    return isRestricted ? `LAO: ${name}` : name
  }
  return personSummary.personType === 'RestrictedPersonSummary' ? 'LAO' : 'Unknown'
}

/**
 * Returns the person's name if they are a FullPerson, otherwise returns 'the person'
 * @param {Person} person
 * @returns 'the person' | person.name
 */
const nameOrPlaceholderCopy = (
  person: Person,
  copyForRestrictedPerson = 'the person',
  showLaoLabel = false,
): string => {
  return isFullPerson(person) ? nameText(person, showLaoLabel) : copyForRestrictedPerson
}

const nameText = (person: FullPerson, showLaoLabel: boolean) => {
  let { name } = person
  if (showLaoLabel && person.isRestricted) {
    name += ' (Limited access offender)'
  }
  return name
}

export { tierBadge, isApplicableTier, isFullPerson, nameOrPlaceholderCopy, laoName, laoSummaryName, isUnknownPerson }
