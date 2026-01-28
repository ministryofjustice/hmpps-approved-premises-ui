import { createMock } from '@golevelup/ts-jest'
import { Adjudication, Licence } from '@approved-premises/api'
import { offencesTabCards } from './sentenceUtils'
import { sentenceLicenceTabController, sentenceOffencesTabController, sentencePrisonTabController } from './sentence'
import {
  activeOffenceFactory,
  adjudicationFactory,
  cas1OasysGroupFactory,
  licenceFactory,
  csraSummaryFactory,
} from '../../testutils/factories'
import * as sentenceUtils from './sentenceUtils'
import { PersonService } from '../../services'
import { ErrorWithData } from '../errors'
import { fullPersonFactory } from '../../testutils/factories/person'

const personService = createMock<PersonService>({})

jest.mock('nunjucks')

const crn = 'S123456'
const token = 'token'

const mockService404 = async () => {
  throw new ErrorWithData({ status: 404 })
}

describe('sentenceTabController', () => {
  const offences = [
    ...activeOffenceFactory.buildList(5, { mainOffence: false }),
    activeOffenceFactory.build({ mainOffence: true }),
  ]

  describe('sentenceOffencesTabController', () => {
    it('should render the sentenceOffencesTab card list', async () => {
      const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      personService.getOasysAnswers.mockResolvedValue(offenceDetails)
      personService.getOffences.mockResolvedValue(offences)

      expect(await sentenceOffencesTabController({ personService, token, crn })).toEqual({
        subHeading: 'Offence',
        cardList: offencesTabCards(offences, offenceDetails),
      })

      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
    })

    it('should render the sentenceOffencesTab card list if there is no oasys record and no offences', async () => {
      personService.getOasysAnswers.mockImplementation(mockService404)
      personService.getOffences.mockImplementation(mockService404)

      expect(await sentenceOffencesTabController({ personService, token, crn })).toEqual({
        subHeading: 'Offence',
        cardList: offencesTabCards(undefined, undefined),
      })

      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
    })
  })

  describe('sentencePrisonTabController', () => {
    it('should render the prison side-tab', async () => {
      const adjudications: Array<Adjudication> = adjudicationFactory.buildList(2)
      const csraSummaries = csraSummaryFactory.buildList(3)
      const person = fullPersonFactory.build()

      personService.getAdjudications.mockResolvedValue(adjudications)
      personService.csraSummaries.mockResolvedValue(csraSummaries)
      personService.findByCrn.mockResolvedValue(person)

      jest.spyOn(sentenceUtils, 'prisonCards').mockReturnValue([])

      expect(await sentencePrisonTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Prison',
      })
      expect(sentenceUtils.prisonCards).toHaveBeenCalledWith(adjudications, csraSummaries, person)
      expect(personService.getAdjudications).toHaveBeenCalledWith(token, crn)
      expect(personService.csraSummaries).toHaveBeenCalledWith(token, crn)
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
    })

    it('should render the prison side-tab when adjudication call returns 404', async () => {
      personService.getAdjudications.mockImplementation(mockService404)
      personService.csraSummaries.mockImplementation(mockService404)
      personService.findByCrn.mockImplementation(mockService404)

      jest.spyOn(sentenceUtils, 'prisonCards').mockReturnValue([])

      expect(await sentencePrisonTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Prison',
      })

      expect(sentenceUtils.prisonCards).toHaveBeenCalledWith(undefined, undefined, undefined)
      expect(personService.getAdjudications).toHaveBeenCalledWith(token, crn)
      expect(personService.csraSummaries).toHaveBeenCalledWith(token, crn)
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

      expect(sentenceUtils.licenseCards).toHaveBeenCalledWith(licence)
      expect(personService.licenceDetails).toHaveBeenCalledWith(token, crn)
    })

    it('should render the licence side-tab when external call returns 404', async () => {
      personService.licenceDetails.mockImplementation(mockService404)

      expect(await sentenceLicenceTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Licence',
      })

      expect(sentenceUtils.licenseCards).toHaveBeenCalledWith(undefined)
      expect(personService.licenceDetails).toHaveBeenCalledWith(token, crn)
    })
  })
})
