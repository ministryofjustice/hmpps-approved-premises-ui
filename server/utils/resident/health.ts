import { Cas1OASysGroup, PersonAcctAlert } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from './index'
import { healthDetailsCards, mentalHealthCards } from './healthUtils'
import { settlePromises } from '../utils'

export const healthTabController = async ({ personService, token, crn }: TabControllerParameters): Promise<TabData> => {
  const [supportingInformation]: [Cas1OASysGroup] = await settlePromises([
    personService.getOasysAnswers(token, crn, 'supportingInformation', [13]),
  ])
  return {
    subHeading: 'Health and disability',
    cardList: healthDetailsCards(supportingInformation),
  }
}

export const mentalHealthTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [personAcctAlerts, riskToSelf]: [Array<PersonAcctAlert>, Cas1OASysGroup] = await settlePromises([
    personService.getAcctAlerts(token, crn),
    personService.getOasysAnswers(token, crn, 'riskToSelf'),
  ])
  return {
    subHeading: 'Mental health',
    cardList: mentalHealthCards(personAcctAlerts, riskToSelf),
  }
}
