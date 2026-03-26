import { Adjudication, Cas1OASysGroup, Licence, CsraSummary, Person, PrisonCaseNote } from '@approved-premises/api'
import { licenseCards, offencesTabCards, prisonCards } from './sentenceUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { TabData } from '.'
import { settlePromisesWithOutcomes } from '../utils'

export const sentenceOffencesTabController = async ({
  personService,
  token,
  crn,
  caseDetail,
  caseDetailOutcome,
}: TabControllerParameters): Promise<TabData> => {
  const {
    outcomes: [oasysOutcome],
    values: [oasysAnswers],
  } = await settlePromisesWithOutcomes<[Cas1OASysGroup]>([personService.getOasysAnswers(token, crn, 'offenceDetails')])
  return {
    subHeading: 'Offence and sentence',
    cardList: offencesTabCards({ caseDetail, caseDetailOutcome, oasysAnswers, oasysOutcome }),
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
    outcomes: [adjudicationResult, csraResult, personResult, caseNotesResult],
    values: [adjudications, csraSummaries, person, caseNotes],
  } = await settlePromisesWithOutcomes<[Array<Adjudication>, Array<CsraSummary>, Person, Array<PrisonCaseNote>]>([
    personService.getAdjudications(token, crn),
    personService.csraSummaries(token, crn),
    personService.findByCrn(token, crn),
    personService.getPrisonCaseNotes(token, crn),
  ])
  return {
    subHeading: 'Prison',
    cardList: prisonCards({
      adjudications,
      csraSummaries,
      person,
      adjudicationResult,
      csraResult,
      personResult,
      caseNotes,
      caseNotesResult,
    }),
  }
}
