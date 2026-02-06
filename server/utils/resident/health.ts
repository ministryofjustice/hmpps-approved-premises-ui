import { Cas1OASysGroup, PersonAcctAlert } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from './index'
import { drugAndAlcoholCards, healthDetailsCards, mentalHealthCards } from './healthUtils'
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
  const [personAcctAlerts, riskToSelf, supportingInformation]: [
    Array<PersonAcctAlert>,
    Cas1OASysGroup,
    Cas1OASysGroup,
  ] = await settlePromises([
    personService.getAcctAlerts(token, crn),
    personService.getOasysAnswers(token, crn, 'riskToSelf'),
    personService.getOasysAnswers(token, crn, 'supportingInformation', [10]),
  ])
  return {
    subHeading: 'Mental health',
    cardList: mentalHealthCards(personAcctAlerts, riskToSelf, supportingInformation),
  }
}

export const drugAndAlcoholTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [supportingInformation] = await settlePromises<[Cas1OASysGroup]>([
    personService.getOasysAnswers(token, crn, 'supportingInformation', [8, 9]),
  ])
  return { subHeading: 'Drug and Alcohol use', cardList: drugAndAlcoholCards(supportingInformation) }
}
