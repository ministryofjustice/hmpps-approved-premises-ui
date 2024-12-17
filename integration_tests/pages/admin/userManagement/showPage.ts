import Page from '../../page'
import paths from '../../../../server/paths/admin'

import {
  Cas1CruManagementArea,
  ApprovedPremisesUser as User,
  UserQualification,
  ApprovedPremisesUserRole as UserRole,
} from '../../../../server/@types/shared'
import { AllocationRole, userSummaryListItems } from '../../../../server/utils/users'

export default class ShowPage extends Page {
  constructor() {
    super('Manage permissions')
  }

  static visit(userId: string): ShowPage {
    cy.visit(paths.admin.userManagement.edit({ id: userId }))
    return new ShowPage()
  }

  shouldShowUserDetails(user: User): void {
    this.shouldContainSummaryListItems(userSummaryListItems(user))
  }

  uncheckUsersPreviousRoles(): void {
    cy.get('[type="checkbox"]').uncheck()
  }

  selectRoles(roles: ReadonlyArray<UserRole>): void {
    this.uncheckUsersPreviousRoles()
    roles.forEach(role => {
      this.checkCheckboxByValue(role)
    })
  }

  selectAllocationRoles(roles: ReadonlyArray<UserRole>): void {
    roles.forEach(role => {
      this.checkCheckboxByValue(role)
    })
  }

  selectUserQualifications(roles: ReadonlyArray<UserQualification>): void {
    roles.forEach(role => {
      this.checkCheckboxByValue(role)
    })
  }

  completeForm({
    roles,
    allocationRoles,
    qualifications,
    cruManagementArea,
  }: {
    roles: ReadonlyArray<UserRole>
    allocationRoles: ReadonlyArray<AllocationRole>
    qualifications: ReadonlyArray<UserQualification>
    cruManagementArea: Readonly<Cas1CruManagementArea>
  }): void {
    this.selectRoles(roles)
    this.selectAllocationRoles(allocationRoles)
    this.selectUserQualifications(qualifications)
    this.getSelectInputByIdAndSelectAnEntry('cruManagementAreaOverrideId', cruManagementArea.name)
  }

  clickRemoveAccess(): void {
    cy.get('a').contains('Remove access').click()
  }

  shouldHaveCriteriaSelected(roles: Array<string>): void {
    roles.forEach(role => {
      cy.get(`input[name="roles"][value="${role}"]`).should('be.checked')
    })
  }
}
