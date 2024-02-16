import { ApplyPage } from './applyPage'

export class ConfirmPersonPage extends ApplyPage {
  async fillSedField(date: { day: string; month: string; year: string }) {
    await this.page.getByRole('group', { name: 'Sentence end date (SED)' }).getByLabel('Day').fill(date.day)
    await this.page.getByRole('group', { name: 'Sentence end date (SED)' }).getByLabel('Month').fill(date.month)
    await this.page.getByRole('group', { name: 'Sentence end date (SED)' }).getByLabel('Year').fill(date.year)
  }
}
