import Page from '../page'

export default class NewPlacementPage extends Page {
  constructor() {
    super('New placement')
  }

  completeForm({ startDate, endDate, reason }: { startDate: string; endDate: string; reason: string }) {
    this.completeDatePicker('startDate', startDate)
    this.completeDatePicker('endDate', endDate)
    this.completeTextArea('reason', reason)
  }
}
