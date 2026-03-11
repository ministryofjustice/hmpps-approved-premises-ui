import { createMock } from '@golevelup/ts-jest'
import { Adjudication, Licence } from '@approved-premises/api'
import { oasysOffenceCards, sentenceCards } from './sentenceUtils'
import { sentenceLicenceTabController, sentenceOffencesTabController, sentencePrisonTabController } from './sentence'
import {
  adjudicationFactory,
  cas1OasysGroupFactory,
  licenceFactory,
  csraSummaryFactory,
  cas1SpaceBookingFactory,
  prisonCaseNotesFactory,
  caseDetailFactory,
} from '../../testutils/factories'
import * as sentenceUtils from './sentenceUtils'
import { PersonService } from '../../services'
import { ErrorWithData } from '../errors'

const personService = createMock<PersonService>({})

jest.mock('nunjucks')

const mockService404 = async () => {
  throw new ErrorWithData({ status: 404 })
}

describe('sentenceTabController', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { person } = placement
  const { crn } = person
  const token = 'token'

  describe('sentenceOffencesTabController', () => {
    it('should render the sentenceOffencesTab card list', async () => {
      const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      const caseDetail = caseDetailFactory.build()
      personService.getOasysAnswers.mockResolvedValue(offenceDetails)
      personService.getCaseDetail.mockResolvedValue(caseDetail)

      expect(await sentenceOffencesTabController({ personService, token, crn, placement })).toEqual({
        subHeading: 'Offence and sentence',
        cardList: [
          ...sentenceUtils.offenceCards(caseDetail, 'success'),
          ...oasysOffenceCards(offenceDetails, 'success'),
          ...sentenceCards(caseDetail, 'success'),
        ],
      })

      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
      expect(personService.getCaseDetail).toHaveBeenCalledWith(token, crn)
    })

    it('should render the sentenceOffencesTab card list if there is no oasys record and no offences', async () => {
      personService.getOasysAnswers.mockImplementation(mockService404)
      personService.getCaseDetail.mockImplementation(mockService404)

      expect(await sentenceOffencesTabController({ personService, token, crn, placement })).toEqual({
        subHeading: 'Offence and sentence',
        cardList: [
          ...sentenceUtils.offenceCards(undefined, 'notFound'),
          ...oasysOffenceCards(undefined, 'notFound'),
          ...sentenceCards(undefined, 'notFound'),
        ],
      })

      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
      expect(personService.getCaseDetail).toHaveBeenCalledWith(token, crn)
    })
  })

  describe('sentencePrisonTabController', () => {
    it('should render the prison side-tab', async () => {
      const adjudications: Array<Adjudication> = adjudicationFactory.buildList(2)
      const csraSummaries = csraSummaryFactory.buildList(3)
      const caseNotes = prisonCaseNotesFactory.buildList(2)

      personService.getAdjudications.mockResolvedValue(adjudications)
      personService.csraSummaries.mockResolvedValue(csraSummaries)
      personService.findByCrn.mockResolvedValue(person)
      personService.getPrisonCaseNotes.mockResolvedValue(caseNotes)

      jest.spyOn(sentenceUtils, 'prisonCards').mockReturnValue([])

      expect(await sentencePrisonTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Prison',
      })
      expect(sentenceUtils.prisonCards).toHaveBeenCalledWith({
        adjudications,
        csraSummaries,
        person,
        caseNotes,
        adjudicationResult: 'success',
        csraResult: 'success',
        personResult: 'success',
        caseNotesResult: 'success',
      })
      expect(personService.getAdjudications).toHaveBeenCalledWith(token, crn)
      expect(personService.csraSummaries).toHaveBeenCalledWith(token, crn)
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
      expect(personService.getPrisonCaseNotes).toHaveBeenCalledWith(token, crn)
    })

    it('should render the prison side-tab when adjudication call returns 404', async () => {
      personService.getAdjudications.mockImplementation(mockService404)
      personService.csraSummaries.mockImplementation(mockService404)
      personService.findByCrn.mockImplementation(mockService404)
      personService.getPrisonCaseNotes.mockImplementation(mockService404)

      jest.spyOn(sentenceUtils, 'prisonCards').mockReturnValue([])

      expect(await sentencePrisonTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Prison',
      })

      expect(sentenceUtils.prisonCards).toHaveBeenCalledWith({
        adjudications: undefined,
        csraSummaries: undefined,
        person: undefined,
        caseNotes: undefined,
        adjudicationResult: 'notFound',
        csraResult: 'notFound',
        personResult: 'notFound',
        caseNotesResult: 'notFound',
      })
      expect(personService.getAdjudications).toHaveBeenCalledWith(token, crn)
      expect(personService.csraSummaries).toHaveBeenCalledWith(token, crn)
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
      expect(personService.getPrisonCaseNotes).toHaveBeenCalledWith(token, crn)
    })
  })

  describe('sentenceLicenceTabController', () => {
    beforeEach(() => {
      jest.spyOn(sentenceUtils, 'licenseCards').mockReturnValue([])
    })

    it('should render the licence side-tab', async () => {
      const licence: Licence = licenceFactory.build()

      personService.licenceDetails.mockResolvedValue(licence)

      expect(await sentenceLicenceTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Licence',
      })

      expect(sentenceUtils.licenseCards).toHaveBeenCalledWith(licence, 'success')
      expect(personService.licenceDetails).toHaveBeenCalledWith(token, crn)
    })

    it('should render the licence side-tab when external call returns 404', async () => {
      personService.licenceDetails.mockImplementation(mockService404)

      expect(await sentenceLicenceTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Licence',
      })

      expect(sentenceUtils.licenseCards).toHaveBeenCalledWith(undefined, 'notFound')
      expect(personService.licenceDetails).toHaveBeenCalledWith(token, crn)
    })
  })
})
