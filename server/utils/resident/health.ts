import { PersonAcctAlert } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from './index'
import { mentalHealthCards } from './healthUtils'

export const healthTabController = async (): Promise<TabData> => {
  return {
    subHeading: 'Health and disability',
  }
}

export const mentalHealthTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [personAcctAlerts]: [Array<PersonAcctAlert>] = await Promise.all([personService.getAcctAlerts(token, crn)])
  return {
    subHeading: 'Mental health',
    cardList: mentalHealthCards(personAcctAlerts),
  }
}
