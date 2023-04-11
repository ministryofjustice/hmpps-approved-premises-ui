import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { YesOrNo } from '@approved-premises/ui'

import AssessPage from './assessPage'

import InformationReceived from '../../../server/form-pages/assess/reviewApplication/sufficientInformation/informationReceived'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class InformationReceivedPage extends AssessPage {
  pageClass: InformationReceived

  constructor(
    assessment: Assessment,
    body: {
      informationReceived: YesOrNo
      response: string
      responseReceivedOn: string
    },
  ) {
    super(assessment, 'Additional information')
    if (body.responseReceivedOn) {
      const parsedDate = DateFormats.isoToDateObj(body.responseReceivedOn)
      this.pageClass = new InformationReceived({
        ...body,
        'responseReceivedOn-day': String(parsedDate.getDate()),
        'responseReceivedOn-month': String(parsedDate.getMonth() + 1),
        'responseReceivedOn-year': String(parsedDate.getFullYear()),
      })
    } else {
      this.pageClass = new InformationReceived(body)
    }
  }

  completeForm() {
    this.checkRadioByNameAndValue('informationReceived', this.pageClass.body.informationReceived)
    if (this.pageClass.body.informationReceived === 'yes') {
      this.completeTextArea('response', this.pageClass.body.response)
      this.completeDateInputs('responseReceivedOn', this.pageClass.body.responseReceivedOn)
    }
  }

  addNote(note: string) {
    this.completeTextArea('query', note)
  }
}
