import fs from 'fs'
import path from 'path'

import { testCrnList } from '../../server/controllers/apply/people/offencesController'

export type TestPerson = {
  crn: string
  name: string
}

const csvPath = path.join(__dirname, 'testPersons.csv')

const parseCsv = (contents: string): Array<TestPerson> => {
  const [, ...rows] = contents.trim().split('\n')
  return rows
    .map(row => row.trim())
    .filter(Boolean)
    .map(row => {
      const [crn, name] = row.split(',')
      return { crn: crn.trim(), name: name.trim() }
    })
}

export const testPersons: Array<TestPerson> = parseCsv(fs.readFileSync(csvPath, 'utf-8'))

const csvCrns = testPersons.map(person => person.crn)
const missingFromTestCrnList = csvCrns.filter(crn => !testCrnList.includes(crn))


if (missingFromTestCrnList.length > 0) {
  throw new Error(
    `e2e/testData/testPersons.csv contains CRN(s) not present in testCrnList: ${missingFromTestCrnList.join(', ')}. ` +
      `Add them to offencesController.ts's testCrnList so they skip the 'one application per CRN' rule.`,
  )
}

export const rotatingTestPersons = testPersons

export const randomTestPerson = (): TestPerson =>
  rotatingTestPersons[Math.floor(Math.random() * rotatingTestPersons.length)]
