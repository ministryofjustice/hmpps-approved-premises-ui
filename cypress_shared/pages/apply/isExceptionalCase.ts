import { YesOrNo } from '@approved-premises/ui'
import Page from '../page'

export default class IsExceptionalCasePage extends Page {
  constructor() {
    super('This application is not eligible')
  }

  completeForm(answer: YesOrNo) {
    this.checkRadioByNameAndValue('isExceptionalCase', answer)
  }
}
