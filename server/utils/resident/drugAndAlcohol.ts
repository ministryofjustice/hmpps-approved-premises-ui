import { Cas1OASysGroup } from '@approved-premises/api'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from './index'
import { drugAndAlcoholCards } from './drugAndAlcoholUtils'
import { settlePromises } from '../utils'

export const drugAndAlcoholTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [supportingInformation] = await settlePromises<[Cas1OASysGroup]>([
    personService.getOasysAnswers(token, crn, 'supportingInformation', [8, 9]),
  ])
  return { cardList: drugAndAlcoholCards(supportingInformation) }
}
