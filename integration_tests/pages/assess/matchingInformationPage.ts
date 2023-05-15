import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
import MatchingInformation from '../../../server/form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import AssessPage from './assessPage'
import { offenceAndRiskOptions, placementRequirementOptions } from '../../../server/utils/placementCriteriaUtils'

export default class MatchingInformationPage extends AssessPage {
  pageClass = new MatchingInformation({
    apType: 'isEsap',
    mentalHealthSupport: '1',
    isWheelchairDesignated: 'essential',
    isSingleRoom: 'desirable',
    isStepFreeDesignated: 'essential',
    isCatered: 'desirable',
    isGroundFloor: 'desirable',
    acceptsSexOffenders: 'relevant',
    acceptsNonSexualChildOffenders: 'notRelevant',
    acceptsChildSexOffenders: 'relevant',
    isArsonSuitable: 'notRelevant',
    acceptsHateCrimeOffenders: 'relevant',
    isSuitableForVulnerable: 'notRelevant',
    hasEnSuite: 'notRelevant',
  })

  constructor(assessment: Assessment) {
    super(assessment, 'Matching information')
  }

  completeForm() {
    this.checkRadioByNameAndValue('apType', this.pageClass.body.apType)
    this.checkCheckboxByNameAndValue('mentalHealthSupport', '1')

    Object.keys(placementRequirementOptions).forEach(requirement => {
      this.checkRadioByNameAndValue(requirement, this.pageClass.body[requirement])
    })

    Object.keys(offenceAndRiskOptions).forEach(offenceAndRiskInformationKey => {
      this.checkRadioByNameAndValue(offenceAndRiskInformationKey, this.pageClass.body[offenceAndRiskInformationKey])
    })
  }
}
