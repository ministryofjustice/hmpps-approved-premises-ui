import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
import MatchingInformation from '../../../server/form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import AssessPage from './assessPage'
import { offenceAndRiskOptions, placementRequirementOptions } from '../../../server/utils/placementCriteriaUtils'

export default class MatchingInformationPage extends AssessPage {
  pageClass = new MatchingInformation(
    {
      apType: 'isEsap',
      accessibilityCriteria: ['hasBrailleSignage'],
      specialistSupportCriteria: ['isSemiSpecialistMentalHealth'],
      isArsonDesignated: 'essential',
      isWheelchairDesignated: 'essential',
      isSingleRoom: 'desirable',
      isStepFreeDesignated: 'desirable',
      isCatered: 'notRelevant',
      isGroundFloor: 'notRelevant',
      hasEnSuite: 'notRelevant',
      isSuitableForVulnerable: 'relevant',
      acceptsSexOffenders: 'relevant',
      acceptsChildSexOffenders: 'relevant',
      acceptsNonSexualChildOffenders: 'relevant',
      acceptsHateCrimeOffenders: 'relevant',
      isArsonSuitable: 'relevant',
      isSuitedForSexOffenders: 'essential',
      lengthOfStayAgreed: 'yes',
      cruInformation: 'Some info',
    },
    this.assessment,
  )

  constructor(assessment: Assessment) {
    super(assessment, 'Matching information')
  }

  completeForm() {
    this.checkRadioByNameAndValue('apType', this.pageClass.body.apType)

    this.pageClass.body.accessibilityCriteria.forEach(requirement => {
      this.checkCheckboxByLabel(requirement)
    })

    this.pageClass.body.specialistSupportCriteria.forEach(requirement => {
      this.checkCheckboxByLabel(requirement)
    })

    Object.keys(placementRequirementOptions).forEach(requirement => {
      this.checkRadioByNameAndValue(requirement, this.pageClass.body[requirement])
    })

    Object.keys(offenceAndRiskOptions).forEach(offenceAndRiskInformationKey => {
      this.checkRadioByNameAndValue(offenceAndRiskInformationKey, this.pageClass.body[offenceAndRiskInformationKey])
    })

    this.checkRadioByNameAndValue('lengthOfStayAgreed', this.pageClass.body.lengthOfStayAgreed)

    this.completeTextArea('cruInformation', this.pageClass.body.cruInformation)
  }
}
