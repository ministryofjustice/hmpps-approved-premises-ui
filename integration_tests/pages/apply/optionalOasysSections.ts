import { ApprovedPremisesApplication, Cas1OASysSupportingInformationQuestionMetaData } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class OptionalOasysSectionsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication, oasysMissing = false) {
    const title = oasysMissing ? 'Oasys Information' : 'Which of the following sections of OASys do you want to import?'
    super(
      title,
      application,
      'oasys-import',
      'optional-oasys-sections',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm(
    oasysSectionsLinkedToReoffending: Array<Cas1OASysSupportingInformationQuestionMetaData>,
    otherOasysSections: Array<Cas1OASysSupportingInformationQuestionMetaData>,
  ): void {
    oasysSectionsLinkedToReoffending.forEach(({ section }) => {
      this.checkCheckboxByNameAndValue('needsLinkedToReoffending', section.toString())
    })
    otherOasysSections.forEach(({ section }) => {
      this.checkRadioByNameAndValue('otherNeeds', section.toString())
    })
  }
}
