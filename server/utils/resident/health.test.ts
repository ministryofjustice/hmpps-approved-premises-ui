import { createMock } from '@golevelup/ts-jest'
import { Cas1OASysGroupName } from '@approved-premises/api'
import * as healthUtils from './healthUtils'
import { card } from './index'
import { healthTabController, mentalHealthTabController } from './health'
import { PersonService } from '../../services'
import { acctAlertFactory, cas1OasysGroupFactory } from '../../testutils/factories'
import { healthDetailsCards } from './healthUtils'
import { ErrorWithData } from '../errors'

const mockCardList = [card({ title: 'mock card' })]
const personService = createMock<PersonService>({})
const token = 'token'
const crn = 'crn'

const personAcctAlerts = acctAlertFactory.buildList(10)
const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()
const riskToSelf = cas1OasysGroupFactory.riskToSelf().build()

describe('Health tab', () => {
  beforeEach(() => {
    personService.getOasysAnswers.mockImplementation(async (_, __, group: Cas1OASysGroupName) => {
      switch (group) {
        case 'riskToSelf':
          return riskToSelf
        case 'supportingInformation':
          return supportingInformation
        default:
          return null
      }
    })
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('healthTabController', () => {
    it('should get acctAlerts and then render the cards', async () => {
      jest.spyOn(healthUtils, 'healthDetailsCards').mockReturnValue(mockCardList)
      personService.getOasysAnswers.mockResolvedValue(supportingInformation)

      const result = await healthTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Health and disability' })
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'supportingInformation', [13])
      expect(healthDetailsCards).toHaveBeenCalledWith(supportingInformation, 'success')
    })
  })

  describe('mentalHealthTabController', () => {
    beforeEach(() => {
      jest.spyOn(healthUtils, 'mentalHealthCards').mockReturnValue(mockCardList)
      personService.getAcctAlerts.mockResolvedValue(personAcctAlerts)
    })

    const successParameters = {
      personAcctAlerts,
      riskToSelf,
      supportingInformation,
      personAcctAlertsOutcome: 'success',
      riskToSelfOutcome: 'success',
      supportingInformationOutcome: 'success',
    }

    it('should get acctAlerts and then render the cards', async () => {
      const result = await mentalHealthTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Mental health' })
      expect(personService.getAcctAlerts).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'riskToSelf')
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'supportingInformation', [10])

      expect(healthUtils.mentalHealthCards).toHaveBeenCalledWith(successParameters)
    })

    it('should render the page if the oasys response fails', async () => {
      personService.getOasysAnswers.mockImplementation(async () => {
        throw new ErrorWithData({ status: 404 })
      })

      const result = await mentalHealthTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Mental health' })
      expect(healthUtils.mentalHealthCards).toHaveBeenCalledWith({
        ...successParameters,
        riskToSelf: undefined,
        riskToSelfOutcome: 'notFound',
        supportingInformation: undefined,
        supportingInformationOutcome: 'notFound',
      })
    })

    it('should render the page if the acct alert response fails', async () => {
      personService.getAcctAlerts.mockImplementation(async () => {
        throw new ErrorWithData({ status: 404 })
      })

      const result = await mentalHealthTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Mental health' })
      expect(healthUtils.mentalHealthCards).toHaveBeenCalledWith({
        ...successParameters,
        personAcctAlerts: undefined,
        personAcctAlertsOutcome: 'notFound',
      })
    })
  })
})
