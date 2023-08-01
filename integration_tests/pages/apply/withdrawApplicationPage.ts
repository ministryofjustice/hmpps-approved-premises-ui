import paths from '../../../server/paths/apply'

import Page from '../page'

export default class WithdrawApplicationPage extends Page {
  constructor() {
    super('Why is this application being withdrawn?')
    this.checkForBackButton(paths.applications.index.pattern)
  }

  completeForm() {
    this.checkRadioByNameAndValue('reason', 'alternative_identified_placement_no_longer_required')
  }
}
