import { FullPerson, Person, PersonRisks } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { contactsCardList, personDetailsCardList } from './personalUtils'

export const personalDetailsTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [person, personRisks]: [Person, PersonRisks] = await Promise.all([
    personService.findByCrn(token, crn),
    personService.riskProfile(token, crn),
  ])

  return {
    subHeading: 'Personal details',
    cardList: personDetailsCardList(person as FullPerson, personRisks),
  }
}

export const contactsTabController = async ({ crn }: TabControllerParameters): Promise<TabData> => {
  return {
    subHeading: 'Contacts',
    cardList: contactsCardList(crn),
  }
}
