import { personalContactFactory } from '../../testutils/factories/caseDetail'
import { contactCard, contactGroupMapping, groupContacts } from './contactUtils'
import { htmlCell, textCell } from '../tableUtils'

describe('contactUtils', () => {
  describe('groupContacts', () => {
    it('should group contacts by type', () => {
      const contacts = Object.keys(contactGroupMapping).map(code => {
        return personalContactFactory.build({ relationshipType: { code } })
      })

      const groups = groupContacts(contacts)
      expect(groups.PROF).toHaveLength(12)
      expect(groups.PERS).toHaveLength(5)
      expect(groups.OTH).toHaveLength(2)
    })

    it('should allocate an unknown code to the "other" list', () => {
      const contact = personalContactFactory.build({ relationshipType: { code: 'INVALID' } })
      expect(groupContacts([contact])).toEqual({ PROF: [], PERS: [], OTH: [contact] })
    })

    it('should group an empty contact list', () => {
      const groups = groupContacts([])
      expect(groups).toEqual({ PROF: [], PERS: [], OTH: [] })
    })
  })

  describe('contactCard', () => {
    it('should render a contact card', () => {
      const contacts = personalContactFactory.build({
        mobileNumber: '010101',
        telephoneNumber: '101010',
        relationship: 'Relationship',
        name: { forename: 'Forename', surname: 'Surname' },
        relationshipType: { code: 'CD', description: 'Type' },
      })
      expect(contactCard('title', [contacts])).toEqual({
        card: {
          title: textCell('title'),
        },
        table: {
          head: ['Type', 'Description', 'Name', 'Phone number'].map(textCell),
          rows: [
            [
              { text: 'Type', attributes: { 'data-code': 'CD' } },
              ...['Relationship', 'Forename Surname'].map(textCell),
              htmlCell('101010<br/>mob: 010101'),
            ],
          ],
        },
      })
    })

    it('should render an empty card', () => {
      expect(contactCard('title', [])).toEqual({
        card: {
          title: textCell('title'),
        },
        html: 'title not provided',
      })
    })
  })
})
