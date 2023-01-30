import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
import MatchingInformation, {
  offenceAndRiskInformationKeys,
  placementRequirements,
} from '../../../server/form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import AssessPage from './assessPage'

export default class MatchingInformationPage extends AssessPage {
  pageClass = new MatchingInformation({
    apGender: 'female',
    apType: 'esap',
    mentalHealthSupport: '1',
    wheelchairAccessible: 'essential',
    singleRoom: 'desirable',
    adaptedForHearingImpairments: 'notRelevant',
    adaptedForVisualImpairments: 'desirable',
    adaptedForRestrictedMobility: 'essential',
    cateringRequired: 'desirable',
    contactSexualOffencesAgainstAnAdultAdults: 'relevant',
    nonContactSexualOffencesAgainstAnAdultAdults: 'notRelevant',
    contactSexualOffencesAgainstChildren: 'relevant',
    nonContactSexualOffencesAgainstChildren: 'notRelevant',
    nonSexualOffencesAgainstChildren: 'relevant',
    arsonOffences: 'notRelevant',
    hateBasedOffences: 'relevant',
    vulnerableToExploitation: 'notRelevant',
  })

  constructor(assessment: Assessment) {
    super(assessment, 'Matching information')
  }

  completeForm() {
    this.checkRadioByNameAndValue('apType', this.pageClass.body.apType)
    this.checkRadioByNameAndValue('apGender', this.pageClass.body.apGender)
    this.checkCheckboxByNameAndValue('mentalHealthSupport', '1')

    placementRequirements.forEach(requirement => {
      this.checkRadioByNameAndValue(requirement, this.pageClass.body[requirement])
    })

    offenceAndRiskInformationKeys.forEach(offenceAndRiskInformationKey => {
      this.checkRadioByNameAndValue(offenceAndRiskInformationKey, this.pageClass.body[offenceAndRiskInformationKey])
    })
  }
}
