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

export type IOrganizationUnitSort =
    | "id__asc"
    | "id__desc"
    | "name__asc"
    | "name__desc";

export interface IOrganizationUnitService {
    listAll(opts?: {
        offset: number;
        limit: number;
        sort: IOrganizationUnitSort;
    }): Promise<Array<IOrganizationUnit>>;
    getById(id: string): Promise<IOrganizationUnit | null>;
    countAll(): Promise<number>;
    search(
        filter: IOrganizationUnitFilter,
        opts?: {
            offset: number;
            limit: number;
            sort: IOrganizationUnitSort;
        }
    );
    countFor(filter: IOrganizationUnitFilter): Promise<number>;
    create(
        newOrganizationUnit: INewOrganizationUnit
    ): Promise<IOrganizationUnit>;
    updateName(id: string, name: string): Promise<void>;
    clearName(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}

class OrganizationUnitServiceImpl implements IOrganizationUnitService {
    constructor(
        private _baseUrl: string = "http://localhost:8080/backend/v1",
        private _headers: Record<string, any> = {}
    ) {}

    async listAll(opts?: {
        offset: number;
        limit: number;
        sort: IOrganizationUnitSort;
    }): Promise<Array<IOrganizationUnit>> {
        let requestUrl = `${this._baseUrl}/organization-unit`;
        if (opts) {
            const params = new URLSearchParams();
            if (opts.offset) {
                params.append("offset", opts.offset.toString());
            }
            if (opts.limit) {
                params.append("limit", opts.limit.toString());
            }
            if (opts.sort) {
                params.append("sort", opts.sort);
            }
            requestUrl += `?${params.toString()}`;
        }
        const response = await fetch(requestUrl, {
            headers: this._headers,
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling GET ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async countAll(): Promise<number> {
        const response = await fetch(
            `${this._baseUrl}/organization-unit/count`,
            {
                headers: this._headers,
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling GET ${this._baseUrl}/organization-unit/count: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async getById(id: string): Promise<IOrganizationUnit | null> {
        const response = await fetch(
            `${this._baseUrl}/organization-unit/${id}`,
            {
                headers: this._headers,
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling GET ${this._baseUrl}/organization-unit/${id}: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async search(
        filter: IOrganizationUnitFilter,
        opts?: {
            offset: number;
            limit: number;
            sort: IOrganizationUnitSort;
        }
    ) {
        let requestUrl = `${this._baseUrl}/organization-unit/search`;
        if (opts) {
            const params = new URLSearchParams();
            if (opts.offset) {
                params.append("offset", opts.offset.toString());
            }
            if (opts.limit) {
                params.append("limit", opts.limit.toString());
            }
            if (opts.sort) {
                params.append("sort", opts.sort);
            }
            requestUrl += `?${params.toString()}`;
        }
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(filter),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async countFor(filter: IOrganizationUnitFilter): Promise<number> {
        const response = await fetch(
            `${this._baseUrl}/organization-unit/search/count`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...this._headers,
                },
                body: JSON.stringify(filter),
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling POST ${this._baseUrl}/organization-unit/search/count: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async create(
        newOrganizationUnit: INewOrganizationUnit
    ): Promise<IOrganizationUnit> {
        const response = await fetch(`${this._baseUrl}/organization-unit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(newOrganizationUnit),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling POST ${this._baseUrl}/organization-unit: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async updateName(id: string, name: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/organization-unit/${id}/name`;
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(name),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async clearName(id: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/organization-unit/${id}/name`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: this._headers,
            credentials: "include",
            body: JSON.stringify(""),
        });
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async remove(id: string): Promise<void> {
        const response = await fetch(
            `${this._baseUrl}/organization-unit/${id}`,
            {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
            }
        );
        if (!response.ok) {
            throw new Error(
                `[OrganizationUnitService] Failed calling DELETE ${this._baseUrl}/organization-unit/${id}: ${response.status} ${response.statusText}`
            );
        }
    }
}

export function createOrganizationUnitService(
    baseUrl: string = "http://localhost:8080/backend/v1",
    headers: Record<string, any> = {}
): IOrganizationUnitService {
    return new OrganizationUnitServiceImpl(baseUrl, headers);
}

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

export type IEmployeeSort =
    | "id__asc"
    | "id__desc"
    | "firstName__asc"
    | "firstName__desc"
    | "lastName__asc"
    | "lastName__desc";

export interface IEmployeeService {
    listAll(opts?: {
        offset: number;
        limit: number;
        sort: IEmployeeSort;
    }): Promise<Array<IEmployee>>;
    getById(id: string): Promise<IEmployee | null>;
    countAll(): Promise<number>;
    search(
        filter: IEmployeeFilter,
        opts?: {
            offset: number;
            limit: number;
            sort: IEmployeeSort;
        }
    );
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

class EmployeeServiceImpl implements IEmployeeService {
    constructor(
        private _baseUrl: string = "http://localhost:8080/backend/v1",
        private _headers: Record<string, any> = {}
    ) {}

    async listAll(opts?: {
        offset: number;
        limit: number;
        sort: IEmployeeSort;
    }): Promise<Array<IEmployee>> {
        let requestUrl = `${this._baseUrl}/employee`;
        if (opts) {
            const params = new URLSearchParams();
            if (opts.offset) {
                params.append("offset", opts.offset.toString());
            }
            if (opts.limit) {
                params.append("limit", opts.limit.toString());
            }
            if (opts.sort) {
                params.append("sort", opts.sort);
            }
            requestUrl += `?${params.toString()}`;
        }
        const response = await fetch(requestUrl, {
            headers: this._headers,
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling GET ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async countAll(): Promise<number> {
        const response = await fetch(`${this._baseUrl}/employee/count`, {
            headers: this._headers,
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling GET ${this._baseUrl}/employee/count: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async getById(id: string): Promise<IEmployee | null> {
        const response = await fetch(`${this._baseUrl}/employee/${id}`, {
            headers: this._headers,
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling GET ${this._baseUrl}/employee/${id}: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async search(
        filter: IEmployeeFilter,
        opts?: {
            offset: number;
            limit: number;
            sort: IEmployeeSort;
        }
    ) {
        let requestUrl = `${this._baseUrl}/employee/search`;
        if (opts) {
            const params = new URLSearchParams();
            if (opts.offset) {
                params.append("offset", opts.offset.toString());
            }
            if (opts.limit) {
                params.append("limit", opts.limit.toString());
            }
            if (opts.sort) {
                params.append("sort", opts.sort);
            }
            requestUrl += `?${params.toString()}`;
        }
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(filter),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async countFor(filter: IEmployeeFilter): Promise<number> {
        const response = await fetch(`${this._baseUrl}/employee/search/count`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(filter),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling POST ${this._baseUrl}/employee/search/count: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async create(newEmployee: INewEmployee): Promise<IEmployee> {
        const response = await fetch(`${this._baseUrl}/employee`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(newEmployee),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling POST ${this._baseUrl}/employee: ${response.status} ${response.statusText}`
            );
        }
        return await response.json();
    }

    async updateFirstName(id: string, firstName: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/employee/${id}/first-name`;
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(firstName),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async clearFirstName(id: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/employee/${id}/first-name`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: this._headers,
            credentials: "include",
            body: JSON.stringify(""),
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async updateLastName(id: string, lastName: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/employee/${id}/last-name`;
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(lastName),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async clearLastName(id: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/employee/${id}/last-name`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: this._headers,
            credentials: "include",
            body: JSON.stringify(""),
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async updateOrgUnit(id: string, orgUnit: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/employee/${id}/org-unit`;
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._headers,
            },
            body: JSON.stringify(orgUnit),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async clearOrgUnit(id: string): Promise<void> {
        const requestUrl = `${this._baseUrl}/employee/${id}/org-unit`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: this._headers,
            credentials: "include",
            body: JSON.stringify(""),
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`
            );
        }
    }
    async remove(id: string): Promise<void> {
        const response = await fetch(`${this._baseUrl}/employee/${id}`, {
            method: "DELETE",
            headers: this._headers,
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(
                `[EmployeeService] Failed calling DELETE ${this._baseUrl}/employee/${id}: ${response.status} ${response.statusText}`
            );
        }
    }
}

export function createEmployeeService(
    baseUrl: string = "http://localhost:8080/backend/v1",
    headers: Record<string, any> = {}
): IEmployeeService {
    return new EmployeeServiceImpl(baseUrl, headers);
}
