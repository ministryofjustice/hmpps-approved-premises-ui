import { createMock } from '@golevelup/ts-jest'
import * as healthUtils from './healthUtils'
import { card } from './index'
import { drugAndAlcoholTabController, healthTabController, mentalHealthTabController } from './health'
import { PersonService } from '../../services'
import { acctAlertFactory, cas1OasysGroupFactory } from '../../testutils/factories'
import { healthDetailsCards } from './healthUtils'

const mockCardList = [card({ title: 'mock card' })]
const personService = createMock<PersonService>({})
const token = 'token'
const crn = 'crn'

const acctAlerts = acctAlertFactory.buildList(10)
const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()
const riskToSelf = cas1OasysGroupFactory.riskToSelf().build()

describe('Health tab', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('healthTabController', () => {
    it('should get acctAlerts and then render the cards', async () => {
      jest.spyOn(healthUtils, 'healthDetailsCards').mockReturnValue(mockCardList)
      personService.getOasysAnswers.mockResolvedValue(supportingInformation)

      const result = await healthTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Health and disability' })
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'supportingInformation', [13])
      expect(healthDetailsCards).toHaveBeenCalledWith(supportingInformation)
    })
  })

  describe('mentalHealthTabController', () => {
    it('should get acctAlerts and then render the cards', async () => {
      jest.spyOn(healthUtils, 'mentalHealthCards').mockReturnValue(mockCardList)
      personService.getAcctAlerts.mockResolvedValue(acctAlerts)
      personService.getOasysAnswers.mockResolvedValue(riskToSelf)

      const result = await mentalHealthTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Mental health' })
      expect(personService.getAcctAlerts).toHaveBeenCalledWith(token, crn)
      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'riskToSelf')

      expect(healthUtils.mentalHealthCards).toHaveBeenCalledWith(acctAlerts, riskToSelf)
    })
  })

  describe('drugAndAlcoholTabController', () => {
    it('should get Oasys supporting info and then render the cards', async () => {
      jest.spyOn(healthUtils, 'drugAndAlcoholCards').mockReturnValue(mockCardList)
      personService.getOasysAnswers.mockResolvedValue(supportingInformation)

      const result = await drugAndAlcoholTabController({ personService, token, crn })

      expect(result).toEqual({ cardList: mockCardList, subHeading: 'Drug and Alcohol use' })

      expect(personService.getOasysAnswers).toHaveBeenCalledWith(token, crn, 'supportingInformation', [8, 9])
      expect(healthUtils.drugAndAlcoholCards).toHaveBeenCalledWith(supportingInformation)
    })
  })
})
