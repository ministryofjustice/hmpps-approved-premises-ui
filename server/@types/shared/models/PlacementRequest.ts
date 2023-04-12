/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
import type { PlacementRequirements } from './PlacementRequirements';
import type { ReleaseTypeOption } from './ReleaseTypeOption';

export type PlacementRequest = (PlacementRequirements & {
    id?: string;
    person?: Person;
    risks?: PersonRisks;
    applicationId?: string;
    assessmentId?: string;
    releaseType?: ReleaseTypeOption;
} & {
    id: string;
    person: Person;
    risks: PersonRisks;
    applicationId: string;
    assessmentId: string;
});

