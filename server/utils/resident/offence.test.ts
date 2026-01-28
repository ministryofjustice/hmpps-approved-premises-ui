import { createMock } from '@golevelup/ts-jest'
import { Adjudication, Licence } from '@approved-premises/api'
import { offencesTabCards } from './offenceUtils'
import { offenceLicenceTabController, offenceOffencesTabController, offencePrisonTabController } from './offence'
import {
  activeOffenceFactory,
  adjudicationFactory,
  cas1OasysGroupFactory,
  licenceFactory,
  csraSummaryFactory,
} from '../../testutils/factories'
import * as offenceUtils from './offenceUtils'
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

  describe('offenceOffencesTabController', () => {
    it('should render the offenceOffencesTab card list', async () => {
      const offenceDetails = cas1OasysGroupFactory.offenceDetails().build()
      personService.getOasysAnswers.mockResolvedValue(offenceDetails)
      personService.getOffences.mockResolvedValue(offences)

      expect(await offenceOffencesTabController({ personService, token, crn })).toEqual({
        subHeading: 'Offence',
        cardList: offencesTabCards(offences, offenceDetails),
      })

      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
    })

    it('should render the offenceOffencesTab card list if there is no oasys record and no offences', async () => {
      personService.getOasysAnswers.mockImplementation(mockService404)
      personService.getOffences.mockImplementation(mockService404)

      expect(await offenceOffencesTabController({ personService, token, crn })).toEqual({
        subHeading: 'Offence',
        cardList: offencesTabCards(undefined, undefined),
      })

      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'offenceDetails')
    })
  })

  describe('offencePrisonTabController', () => {
    it('should render the prison side-tab', async () => {
      const adjudications: Array<Adjudication> = adjudicationFactory.buildList(2)
      const csraSummaries = csraSummaryFactory.buildList(3)
      const person = fullPersonFactory.build()

      personService.getAdjudications.mockResolvedValue(adjudications)
      personService.csraSummaries.mockResolvedValue(csraSummaries)
      personService.findByCrn.mockResolvedValue(person)

      jest.spyOn(offenceUtils, 'prisonCards').mockReturnValue([])

      expect(await offencePrisonTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Prison',
      })
      expect(offenceUtils.prisonCards).toHaveBeenCalledWith(adjudications, csraSummaries, person)
      expect(personService.getAdjudications).toHaveBeenCalledWith(token, crn)
      expect(personService.csraSummaries).toHaveBeenCalledWith(token, crn)
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
    })

    it('should render the prison side-tab when adjudication call returns 404', async () => {
      personService.getAdjudications.mockImplementation(mockService404)
      personService.csraSummaries.mockImplementation(mockService404)
      personService.findByCrn.mockImplementation(mockService404)

      jest.spyOn(offenceUtils, 'prisonCards').mockReturnValue([])

      expect(await offencePrisonTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Prison',
      })

      expect(offenceUtils.prisonCards).toHaveBeenCalledWith(undefined, undefined, undefined)
      expect(personService.getAdjudications).toHaveBeenCalledWith(token, crn)
      expect(personService.csraSummaries).toHaveBeenCalledWith(token, crn)
    })
  })

  describe('offenceLicenceTabController', () => {
    beforeEach(() => {
      jest.spyOn(offenceUtils, 'licenseCards').mockReturnValue([])
    })

    it('should render the licence side-tab', async () => {
      const licence: Licence = licenceFactory.build()

      personService.licenceDetails.mockResolvedValue(licence)

      expect(await offenceLicenceTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Licence',
      })

      expect(offenceUtils.licenseCards).toHaveBeenCalledWith(licence)
      expect(personService.licenceDetails).toHaveBeenCalledWith(token, crn)
    })

    it('should render the licence side-tab when external call returns 404', async () => {
      personService.licenceDetails.mockImplementation(mockService404)

      expect(await offenceLicenceTabController({ personService, token, crn })).toEqual({
        cardList: [],
        subHeading: 'Licence',
      })

      expect(offenceUtils.licenseCards).toHaveBeenCalledWith(undefined)
      expect(personService.licenceDetails).toHaveBeenCalledWith(token, crn)
    })
  })
})
