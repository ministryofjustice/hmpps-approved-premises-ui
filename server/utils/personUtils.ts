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

const isFullPerson = (person?: Person): person is FullPerson => (person as FullPerson)?.type === 'FullPerson'

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
 * Returns the person's name if they are a FullPerson, 'the person' or any other copy provided if they are LAO, or
 * 'Unknown person' if they are unknown.
 * @param {Person}    person
 * @param {string}    copyForRestrictedPerson the copy to use instead of the person's name if the person is LAO
 * @param {boolean}   showLaoLabel append ' (Limited access offender)' if the person is LAO
 * @returns {string}  The name or text to display
 */
const nameOrPlaceholderCopy = (
  person: Person,
  copyForRestrictedPerson: string = 'the person',
  showLaoLabel: boolean = false,
): string => {
  if (isFullPerson(person)) {
    return nameText(person, showLaoLabel)
  }
  return person.type === 'RestrictedPerson' ? copyForRestrictedPerson : 'Unknown person'
}

const nameText = (person: FullPerson, showLaoLabel: boolean) => {
  let { name } = person
  if (showLaoLabel && person.isRestricted) {
    name += ' (Limited access offender)'
  }
  return name
}

export { tierBadge, isApplicableTier, isFullPerson, nameOrPlaceholderCopy, laoName, laoSummaryName, isUnknownPerson }
