import { PersonalContact } from '@approved-premises/api'
import { SummaryListWithCard, TableRow } from '@approved-premises/ui'
import { htmlCell, textCell } from '../tableUtils'
import { card } from './index'

export type ContactGroup = 'PROF' | 'PERS' | 'OTH'

export const contactGroupMapping: Record<string, ContactGroup> = {
  CA: 'PROF',
  MW: 'PROF',
  CH: 'PERS',
  RT04: 'OTH',
  MC: 'PROF',
  CE: 'OTH',
  RT01: 'PROF',
  ME: 'PERS',
  OF: 'PERS',
  RT02: 'PROF',
  CR: 'PROF',
  NK: 'PERS',
  MO: 'PERS',
  DR: 'PROF',
  PA: 'PROF',
  MP: 'PROF',
  RT03: 'PROF',
  SL: 'PROF',
  MS: 'PROF',
}

export const groupContacts = (contacts: Array<PersonalContact>): Record<ContactGroup, Array<PersonalContact>> =>
  contacts.reduce(
    (out, contact) => {
      const contactCode = contact.relationshipType?.code
      out[contactGroupMapping[contactCode] || 'OTH'].push(contact)
      return out
    },
    { PROF: [], PERS: [], OTH: [] },
  )

export const contactCard = (title: string, contacts: Array<PersonalContact>): SummaryListWithCard => {
  const notEnteredText = 'Not entered in NDelius'
  const contactRow = (contact: PersonalContact): TableRow => {
    const {
      name: { forename, surname },
      mobileNumber,
      telephoneNumber,
    } = contact
    const telephoneHtml = `${telephoneNumber || ''}${mobileNumber ? `${telephoneNumber ? '<br/>' : ''}${mobileNumber}${telephoneNumber ? ' (mobile)' : ''}` : ''}`
    const nameText = `${forename || ''} ${surname || ''}`.trim()
    return [
      { text: `${contact.relationshipType?.description}`, attributes: { 'data-code': contact.relationshipType?.code } },
      textCell(contact.relationship || notEnteredText),
      textCell(nameText || notEnteredText),
      htmlCell(telephoneHtml || notEnteredText),
    ]
  }
  return card({
    title,
    table: contacts.length
      ? { head: ['Type', 'Description', 'Name', 'Phone number'].map(textCell), rows: contacts.map(contactRow) }
      : undefined,
    html: !contacts.length ? `${title} not provided` : undefined,
  })
}
