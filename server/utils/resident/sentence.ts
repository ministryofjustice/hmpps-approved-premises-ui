import { ActiveOffence, Adjudication, Cas1OASysGroup } from '@approved-premises/api'
import { licenseCards, offencesTabCards, prisonCards } from './sentenceUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { settlePromises } from '../utils'

export const sentenceOffencesTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [offences, offenceAnswers] = await settlePromises<[Array<ActiveOffence>, Cas1OASysGroup]>([
    personService.getOffences(token, crn),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
  ])

  return { subHeading: 'Offence and sentence', cardList: offencesTabCards(offences, offenceAnswers) }
}

export const sentenceLicenceTabController = async () => {
  return { subHeading: 'Licence', cardList: licenseCards() }
}

export const sentencePrisonTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const [adjudications] = await settlePromises<[Array<Adjudication>]>([personService.getAdjudications(token, crn)])
  return { subHeading: 'Prison', cardList: prisonCards(adjudications) }
}
