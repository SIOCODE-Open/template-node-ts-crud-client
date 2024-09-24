/** No description. */
export interface IOrganizationUnit {
    /** The unique identifier for this Organization Unit */
    id: string;
    /** No description. */
    name: string;
}
/** DTO for a new Organization Unit */
export interface INewOrganizationUnit {
    /** No description. */
    name?: string | null;
}
/** DTO for filtering Organization Unit objects */
export interface IOrganizationUnitFilter {
    and?: Array<IOrganizationUnitFilter>;
    or?: Array<IOrganizationUnitFilter>;
    not?: IOrganizationUnitFilter;
    name?: {
        equals?: string;
        notEquals?: string;
        in?: Array<string>;
        notIn?: Array<string>;
        contains?: string;
        notContains?: string;
        startsWith?: string;
        notStartsWith?: string;
        endsWith?: string;
        notEndsWith?: string;
    };
    id?: {
        equals?: string;
        notEquals?: string;
        in?: Array<string>;
        notIn?: Array<string>;
    };
}
export type IOrganizationUnitSort = "id__asc" | "id__desc" | "name__asc" | "name__desc";
export interface IOrganizationUnitService {
    listAll(opts?: {
        offset: number;
        limit: number;
        sort: IOrganizationUnitSort;
    }): Promise<Array<IOrganizationUnit>>;
    getById(id: string): Promise<IOrganizationUnit | null>;
    countAll(): Promise<number>;
    search(filter: IOrganizationUnitFilter, opts?: {
        offset: number;
        limit: number;
        sort: IOrganizationUnitSort;
    }): any;
    countFor(filter: IOrganizationUnitFilter): Promise<number>;
    create(newOrganizationUnit: INewOrganizationUnit): Promise<IOrganizationUnit>;
    updateName(id: string, name: string): Promise<void>;
    clearName(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}
export declare function createOrganizationUnitService(baseUrl?: string, headers?: Record<string, any>): IOrganizationUnitService;
/** An employee */
export interface IEmployee {
    /** The unique identifier for this Employee */
    id: string;
    /** No description. */
    firstName: string;
    /** No description. */
    lastName: string;
    /** Org unit of employee */
    orgUnit: string;
}
/** DTO for a new Employee */
export interface INewEmployee {
    /** No description. */
    firstName?: string | null;
    /** No description. */
    lastName?: string | null;
    /** Org unit of employee */
    orgUnit?: string | null;
}
/** DTO for filtering Employee objects */
export interface IEmployeeFilter {
    and?: Array<IEmployeeFilter>;
    or?: Array<IEmployeeFilter>;
    not?: IEmployeeFilter;
    firstName?: {
        equals?: string;
        notEquals?: string;
        in?: Array<string>;
        notIn?: Array<string>;
        contains?: string;
        notContains?: string;
        startsWith?: string;
        notStartsWith?: string;
        endsWith?: string;
        notEndsWith?: string;
    };
    lastName?: {
        equals?: string;
        notEquals?: string;
        in?: Array<string>;
        notIn?: Array<string>;
        contains?: string;
        notContains?: string;
        startsWith?: string;
        notStartsWith?: string;
        endsWith?: string;
        notEndsWith?: string;
    };
    id?: {
        equals?: string;
        notEquals?: string;
        in?: Array<string>;
        notIn?: Array<string>;
    };
}
export type IEmployeeSort = "id__asc" | "id__desc" | "firstName__asc" | "firstName__desc" | "lastName__asc" | "lastName__desc";
export interface IEmployeeService {
    listAll(opts?: {
        offset: number;
        limit: number;
        sort: IEmployeeSort;
    }): Promise<Array<IEmployee>>;
    getById(id: string): Promise<IEmployee | null>;
    countAll(): Promise<number>;
    search(filter: IEmployeeFilter, opts?: {
        offset: number;
        limit: number;
        sort: IEmployeeSort;
    }): any;
    countFor(filter: IEmployeeFilter): Promise<number>;
    create(newEmployee: INewEmployee): Promise<IEmployee>;
    updateFirstName(id: string, firstName: string): Promise<void>;
    clearFirstName(id: string): Promise<void>;
    updateLastName(id: string, lastName: string): Promise<void>;
    clearLastName(id: string): Promise<void>;
    updateOrgUnit(id: string, orgUnit: string): Promise<void>;
    clearOrgUnit(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}
export declare function createEmployeeService(baseUrl?: string, headers?: Record<string, any>): IEmployeeService;
//# sourceMappingURL=index.d.ts.map