import { FullPerson, Person } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { contactsCardList, personDetailsCardList } from './personalUtils'

export const personalDetailsTabController = async ({
  personService,
  token,
  crn,
  personRisks,
}: TabControllerParameters): Promise<TabData> => {
  const [person]: [Person] = await Promise.all([personService.findByCrn(token, crn)])

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
