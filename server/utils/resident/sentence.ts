import { ActiveOffence, Adjudication, Cas1OASysGroup, Licence, CsraSummary, Person } from '@approved-premises/api'
import { licenseCards, offencesTabCards, prisonCards } from './sentenceUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { settlePromisesWithOutcomes } from '../utils'

export const sentenceOffencesTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const {
    outcomes: [offencesOutcome, oasysOutcome],
    values: [offences, offenceAnswers],
  } = await settlePromisesWithOutcomes<[Array<ActiveOffence>, Cas1OASysGroup]>([
    personService.getOffences(token, crn),
    personService.getOasysAnswers(token, crn, 'offenceDetails'),
  ])
  return {
    subHeading: 'Offence details',
    cardList: offencesTabCards({ offences, oasysAnswers: offenceAnswers, offencesOutcome, oasysOutcome }),
  }
}

export const sentenceLicenceTabController = async ({
  personService,
  crn,
  token,
}: TabControllerParameters): Promise<TabData> => {
  const {
    outcomes: [licenceResult],
    values: [licence],
  } = await settlePromisesWithOutcomes<[Licence]>([personService.licenceDetails(token, crn)])
  return { subHeading: 'Licence', cardList: licenseCards(licence, licenceResult) }
}

export const sentencePrisonTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const {
    outcomes: [adjudicationResult, csraResult, personResult],
    values: [adjudications, csraSummaries, person],
  } = await settlePromisesWithOutcomes<[Array<Adjudication>, Array<CsraSummary>, Person]>([
    personService.getAdjudications(token, crn),
    personService.csraSummaries(token, crn),
    personService.findByCrn(token, crn),
  ])
  return {
    subHeading: 'Prison',
    cardList: prisonCards({ adjudications, csraSummaries, person, adjudicationResult, csraResult, personResult }),
  }
}
