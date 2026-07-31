import { FullPerson } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { contactsCardList, personDetailsCardList } from './personalUtils'

export const personalDetailsTabController = async ({ placement }: TabControllerParameters): Promise<TabData> => {
  return {
    subHeading: 'Personal details',
    cardList: personDetailsCardList(placement.person as FullPerson),
  }
}

export const contactsTabController = async ({
  crn,
  caseDetail,
  caseDetailOutcome,
}: TabControllerParameters): Promise<TabData> => ({
  subHeading: 'Contacts',
  cardList: contactsCardList(caseDetail, caseDetailOutcome, crn),
})
