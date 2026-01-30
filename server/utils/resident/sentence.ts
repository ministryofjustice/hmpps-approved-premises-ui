import { ActiveOffence, Adjudication, Cas1OASysGroup, Licence, CsraSummary, Person } from '@approved-premises/api'
import { licenseCards, offencesTabCards, prisonCards } from './sentenceUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { settlePromisesWithMeta } from '../utils'

export const sentenceOffencesTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const {
    meta: [offencesMeta, oasysMeta],
    value: [offences, offenceAnswers],
  } = await settlePromisesWithMeta<[Array<ActiveOffence>, Cas1OASysGroup]>([
    personService.getOffences(token, crn),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
  ])
  return {
    subHeading: 'Offence details',
    cardList: offencesTabCards(offences, offenceAnswers, [offencesMeta, oasysMeta]),
  }
}

export const sentenceLicenceTabController = async ({
  personService,
  crn,
  token,
}: TabControllerParameters): Promise<TabData> => {
  const {
    meta: [licenceResult],
    value: [licence],
  } = await settlePromisesWithMeta<[Licence]>([personService.licenceDetails(token, crn)])
  return { subHeading: 'Licence', cardList: licenseCards(licence, licenceResult) }
}

export const sentencePrisonTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const {
    meta: [adjudicationResult, csraResult, personResult],
    value: [adjudications, csraSummaries, person],
  } = await settlePromisesWithMeta<[Array<Adjudication>, Array<CsraSummary>, Person]>([
    personService.getAdjudications(token, crn),
    personService.csraSummaries(token, crn),
    personService.findByCrn(token, crn),
  ])
  return {
    subHeading: 'Prison',
    cardList: prisonCards({ adjudications, csraSummaries, person, adjudicationResult, csraResult, personResult }),
  }
}
