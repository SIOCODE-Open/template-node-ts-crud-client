/** Options for the client services of Backend */
export interface IBackendClientOptions {
    /**
     * The base URL of the Backend API.
     * Default: http://localhost:8080/backend/v1
     */
    baseUrl?: string;
    /**
     * Additional headers to include in requests to the Backend API.
     * Default: {}
     */
    headers?: Record<string, string>;
    /**
     * The API key to use for requests to the Backend API. MUST be supplied!
     */
    apiKey: string;
}

/** Options for listing, such as paging and sorting */
export interface IBackendListingOptions<TSort extends string> {
    /**
     * The offset to start listing from
     */
    offset: number;

    /**
     * The maximum number of items to list
     */
    limit: number;

    /**
     * The field to sort by
     */
    sort?: TSort;
}

/**
 * Helper function to create the listing query parameter string from the listing client parameters object.
 * @param listParams The listing client parameters object
 * @returns The query parameter string
 */
function _listParams<TSort extends string>(
    listParams?: IBackendListingOptions<TSort>
): string {
    if (!listParams) {
        return "";
    }
    const params = new URLSearchParams();
    params.append("offset", listParams.offset.toString());
    params.append("limit", listParams.limit.toString());
    if (listParams.sort) {
        params.append("sort", listParams.sort);
    }
    return `?${params.toString()}`;
}

/**
 * Helper function to make a request using fetch to the Backend API.
 * @param opts The request options
 * @returns The response from the API
 */
async function _makeRequest(
    baseUrl: string,
    headers: Record<string, any>,
    opts: {
        path?: string;
        query?: string;
        method: string;
        body?: any;
        asText?: boolean;
        noOp?: boolean;
    }
): Promise<any> {
    let queryString = "";
    if (typeof opts.query === "string" && opts.query.length > 0) {
        if (opts.query.startsWith("?")) {
            queryString = opts.query;
        } else {
            queryString = `?${opts.query}`;
        }
    }

    let response = null;

    try {
        response = await fetch(`${baseUrl}${opts.path || ""}${queryString}`, {
            method: opts.method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...headers,
            },
            body: JSON.stringify(opts.body),
        });
    } catch (err: any) {
        // FIXME: Better client error handling
        throw new Error(
            `Fetch failed (host probably down) ${opts.method} ${
                opts.path || "/"
            } @ ${baseUrl}: ${err}`
        );
    }
    if (!response.ok) {
        // FIXME: Better client error handling
        throw new Error(
            `Failed calling ${opts.method} ${
                opts.path || "/"
            } @ ${baseUrl} with ${JSON.stringify(opts.body)}: ${
                response.status
            } ${response.statusText}`
        );
    }
    if (opts.noOp) {
        return { ok: true };
    }
    if (opts.asText) {
        return await response.text();
    }
    return await response.json();
}

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
    /**
     * List all Organization Unit objects, optionally applying paging and sorting.
     * @param opts Options for paging and sorting
     * @returns A list of Organization Unit objects
     */
    listAll(
        opts?: IBackendListingOptions<IOrganizationUnitSort>
    ): Promise<Array<IOrganizationUnit>>;

    /**
     * Get a Organization Unit object by its unique identifier.
     * @param id The unique identifier of the Organization Unit object
     * @returns The Organization Unit object. Throws an error if not found.
     */
    getById(id: string): Promise<IOrganizationUnit>;

    /**
     * Count the total number of Organization Unit objects.
     * @returns The total number of Organization Unit objects
     */
    countAll(): Promise<number>;

    /**
     * Search for Organization Unit objects using a filter, optionally applying paging and sorting.
     * @param filter The filter to apply
     * @param opts Options for paging and sorting
     * @returns A list of filtered Organization Unit objects
     */
    search(
        filter: IOrganizationUnitFilter,
        opts?: IBackendListingOptions<IOrganizationUnitSort>
    );

    /**
     * Count the total number of Organization Unit objects that match a filter.
     * @param filter The filter to apply
     * @returns The total number of Organization Unit objects that match the filter
     */
    countFor(filter: IOrganizationUnitFilter): Promise<number>;

    /**
     * Get the Name of a Organization Unit object by its unique identifier.
     * @param id The unique identifier of the Organization Unit object
     * @returns The Name of the given Organization Unit object. Throws an error if the Organization Unit object is not found.
     */
    getNameOf(id: string): Promise<string | null>;

    /**
     * Get the Employees of a Organization Unit object by its unique identifier.
     * @param id The unique identifier of the Organization Unit object
     * @returns The Employees of the given Organization Unit object. Throws an error if the Organization Unit object is not found.
     */
    getEmployeesOf(id: string): Promise<Array<IEmployee>>;

    /**
     * Create a new Organization Unit object.
     * @param newOrganizationUnit The new Organization Unit object to create
     * @returns The newly created Organization Unit object
     */
    create(
        newOrganizationUnit: INewOrganizationUnit
    ): Promise<IOrganizationUnit>;

    /**
     * Create or update a list of Organization Unit objects. Each object will either be created or updated.
     * @param newOrUpdatedEntities The list of Organization Unit objects to create or update
     * @returns The list of newly created or updated Organization Unit objects
     */
    upsert(
        newOrUpdatedEntities: Array<IOrganizationUnit>
    ): Promise<Array<IOrganizationUnit>>;

    /**
     * Update a Organization Unit object by its unique identifier. Requires a value for ALL FIELDS of the object. Nulls will be interpreted as clearing the field. Missing fields will be nulls.
     * @param id The unique identifier of the Organization Unit object
     * @param updatedOrganizationUnit The updated Organization Unit object
     */
    fullUpdate(
        id: string,
        updatedOrganizationUnit: INewOrganizationUnit
    ): Promise<void>;

    /**
     * Update a Organization Unit object by its unique identifier. Requires a value for at least one field of the object. Nulls and missing fields will be ignored.
     * @param id The unique identifier of the Organization Unit object
     * @param updatedFields The fields to update
     */
    partialUpdate(
        id: string,
        updatedFields: Partial<INewOrganizationUnit>
    ): Promise<void>;

    /**
     * Update the name field of a Organization Unit object by its unique identifier.
     * @param id The unique identifier of the Organization Unit object
     * @param name The new value for the name field
     */
    updateName(id: string, name: string): Promise<void>;

    /**
     * Clear the name field of a Organization Unit object by its unique identifier.
     * @param id The unique identifier of the Organization Unit object
     */
    clearName(id: string): Promise<void>;

    /**
     * Remove a Organization Unit object by its unique identifier.
     * @param id The unique identifier of the Organization Unit object
     */
    remove(id: string): Promise<void>;
}

class OrganizationUnitServiceImpl implements IOrganizationUnitService {
    private _baseUrl: string = `http://localhost:8080/backend/v1/organization-unit`;
    private _headers: Record<string, any> = {};
    private _apiKey: string;

    constructor(private _opts: IBackendClientOptions) {
        if (typeof _opts.baseUrl === "string") {
            this._baseUrl = `${_opts.baseUrl}/organization-unit`;
        }
        if (typeof _opts.headers === "object") {
            this._headers = _opts.headers;
        }
        if (typeof _opts.apiKey !== "string") {
            throw new Error(
                `[OrganizationUnitService] An API key is required to use the Backend API`
            );
        }
        this._apiKey = _opts.apiKey;
        this._headers["Authorization"] = `Bearer ${this._apiKey}`;
    }

    async listAll(
        opts?: IBackendListingOptions<IOrganizationUnitSort>
    ): Promise<Array<IOrganizationUnit>> {
        // FIXME: Wrap for error handling
        // TODO: Validate opts
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            query: _listParams(opts),
        });
    }

    async countAll(): Promise<number> {
        // FIXME: Wrap for error handling
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: "/count",
        });
    }

    async getById(id: string): Promise<IOrganizationUnit | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}`,
        });
    }

    async search(
        filter: IOrganizationUnitFilter,
        opts?: IBackendListingOptions<IOrganizationUnitSort>
    ) {
        // FIXME: Wrap for error handling
        // TODO: Validate filter
        // TODO: Validate opts
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: "/search",
            query: _listParams(opts),
            body: filter,
        });
    }

    async countFor(filter: IOrganizationUnitFilter): Promise<number> {
        // FIXME: Wrap for error handling
        // TODO: Validate filter
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: "/search/count",
            body: filter,
        });
    }

    async getNameOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/name`,
        });
    }

    async getEmployeesOf(id: string): Promise<Array<IEmployee>> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/employees`,
        });
    }

    async create(
        newOrganizationUnit: INewOrganizationUnit
    ): Promise<IOrganizationUnit> {
        // FIXME: Wrap for error handling
        // TODO: Validate payload
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            body: newOrganizationUnit,
        });
    }
    async upsert(
        newOrUpdatedEntities: Array<IOrganizationUnit>
    ): Promise<Array<IOrganizationUnit>> {
        // FIXME: Wrap for error handling
        // TODO: Validate payload
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PUT",
            body: newOrUpdatedEntities,
        });
    }
    async fullUpdate(
        id: string,
        updatedOrganizationUnit: INewOrganizationUnit
    ): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PUT",
            path: `/${id}`,
            body: updatedOrganizationUnit,
            noOp: true,
        });
    }
    async partialUpdate(
        id: string,
        updatedFields: Partial<INewOrganizationUnit>
    ): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PATCH",
            path: `/${id}`,
            body: updatedFields,
            noOp: true,
        });
    }
    async updateName(id: string, name: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate name
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/name`,
            body: name,
            noOp: true,
        });
    }
    async clearName(id: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "DELETE",
            path: `/${id}/name`,
            noOp: true,
        });
    }
    async remove(id: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "DELETE",
            path: `/${id}`,
            noOp: true,
        });
    }
}

export function createOrganizationUnitService(
    opts: IBackendClientOptions
): IOrganizationUnitService {
    return new OrganizationUnitServiceImpl(opts);
}

/** An employee */
export interface IEmployee {
    /** The unique identifier for this Employee */
    id: string;

    /** No description. */
    firstName: string;

    /** No description. */
    lastName: string;

    /** No description. */
    birthDate: string;

    /** No description. */
    lastSeenAt: string;

    /** Org unit of employee */
    orgUnitId: string;
}

/** DTO for a new Employee */
export interface INewEmployee {
    /** No description. */
    firstName?: string | null;

    /** No description. */
    lastName?: string | null;

    /** No description. */
    birthDate?: string | null;

    /** No description. */
    lastSeenAt?: string | null;

    /** Org unit of employee */
    orgUnitId?: string | null;
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
    birthDate?: {
        equals?: string;
        notEquals?: string;
        greaterThan?: string;
        lessThan?: string;
        greaterThanOrEquals?: string;
        lessThanOrEquals?: string;
    };
    lastSeenAt?: {
        equals?: string;
        notEquals?: string;
        greaterThan?: string;
        lessThan?: string;
        greaterThanOrEquals?: string;
        lessThanOrEquals?: string;
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
    | "lastName__desc"
    | "birthDate__asc"
    | "birthDate__desc"
    | "lastSeenAt__asc"
    | "lastSeenAt__desc";

export interface IEmployeeService {
    /**
     * List all Employee objects, optionally applying paging and sorting.
     * @param opts Options for paging and sorting
     * @returns A list of Employee objects
     */
    listAll(
        opts?: IBackendListingOptions<IEmployeeSort>
    ): Promise<Array<IEmployee>>;

    /**
     * Get a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @returns The Employee object. Throws an error if not found.
     */
    getById(id: string): Promise<IEmployee>;

    /**
     * Count the total number of Employee objects.
     * @returns The total number of Employee objects
     */
    countAll(): Promise<number>;

    /**
     * Search for Employee objects using a filter, optionally applying paging and sorting.
     * @param filter The filter to apply
     * @param opts Options for paging and sorting
     * @returns A list of filtered Employee objects
     */
    search(
        filter: IEmployeeFilter,
        opts?: IBackendListingOptions<IEmployeeSort>
    );

    /**
     * Count the total number of Employee objects that match a filter.
     * @param filter The filter to apply
     * @returns The total number of Employee objects that match the filter
     */
    countFor(filter: IEmployeeFilter): Promise<number>;

    /**
     * Get the First Name of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @returns The First Name of the given Employee object. Throws an error if the Employee object is not found.
     */
    getFirstNameOf(id: string): Promise<string | null>;

    /**
     * Get the Last Name of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @returns The Last Name of the given Employee object. Throws an error if the Employee object is not found.
     */
    getLastNameOf(id: string): Promise<string | null>;

    /**
     * Get the Birth Date of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @returns The Birth Date of the given Employee object. Throws an error if the Employee object is not found.
     */
    getBirthDateOf(id: string): Promise<string | null>;

    /**
     * Get the Last Seen At of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @returns The Last Seen At of the given Employee object. Throws an error if the Employee object is not found.
     */
    getLastSeenAtOf(id: string): Promise<string | null>;

    /**
     * Get the Org Unit of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @returns The Org Unit of the given Employee object. Throws an error if the Employee object is not found.
     */
    getOrgUnitOf(id: string): Promise<IOrganizationUnit | null>;

    /**
     * Create a new Employee object.
     * @param newEmployee The new Employee object to create
     * @returns The newly created Employee object
     */
    create(newEmployee: INewEmployee): Promise<IEmployee>;

    /**
     * Create or update a list of Employee objects. Each object will either be created or updated.
     * @param newOrUpdatedEntities The list of Employee objects to create or update
     * @returns The list of newly created or updated Employee objects
     */
    upsert(newOrUpdatedEntities: Array<IEmployee>): Promise<Array<IEmployee>>;

    /**
     * Update a Employee object by its unique identifier. Requires a value for ALL FIELDS of the object. Nulls will be interpreted as clearing the field. Missing fields will be nulls.
     * @param id The unique identifier of the Employee object
     * @param updatedEmployee The updated Employee object
     */
    fullUpdate(id: string, updatedEmployee: INewEmployee): Promise<void>;

    /**
     * Update a Employee object by its unique identifier. Requires a value for at least one field of the object. Nulls and missing fields will be ignored.
     * @param id The unique identifier of the Employee object
     * @param updatedFields The fields to update
     */
    partialUpdate(
        id: string,
        updatedFields: Partial<INewEmployee>
    ): Promise<void>;

    /**
     * Update the firstName field of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @param firstName The new value for the firstName field
     */
    updateFirstName(id: string, firstName: string): Promise<void>;

    /**
     * Update the lastName field of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @param lastName The new value for the lastName field
     */
    updateLastName(id: string, lastName: string): Promise<void>;

    /**
     * Update the birthDate field of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @param birthDate The new value for the birthDate field
     */
    updateBirthDate(id: string, birthDate: string): Promise<void>;

    /**
     * Update the lastSeenAt field of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @param lastSeenAt The new value for the lastSeenAt field
     */
    updateLastSeenAt(id: string, lastSeenAt: string): Promise<void>;

    /**
     * Clear the lastSeenAt field of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     */
    clearLastSeenAt(id: string): Promise<void>;

    /**
     * Update the orgUnit of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     * @param orgUnit The new value for the orgUnit association
     */
    updateOrgUnit(id: string, orgUnit: string): Promise<void>;

    /**
     * Clear the orgUnit of a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     */
    clearOrgUnit(id: string): Promise<void>;
    /**
     * Remove a Employee object by its unique identifier.
     * @param id The unique identifier of the Employee object
     */
    remove(id: string): Promise<void>;
}

class EmployeeServiceImpl implements IEmployeeService {
    private _baseUrl: string = `http://localhost:8080/backend/v1/employee`;
    private _headers: Record<string, any> = {};
    private _apiKey: string;

    constructor(private _opts: IBackendClientOptions) {
        if (typeof _opts.baseUrl === "string") {
            this._baseUrl = `${_opts.baseUrl}/employee`;
        }
        if (typeof _opts.headers === "object") {
            this._headers = _opts.headers;
        }
        if (typeof _opts.apiKey !== "string") {
            throw new Error(
                `[EmployeeService] An API key is required to use the Backend API`
            );
        }
        this._apiKey = _opts.apiKey;
        this._headers["Authorization"] = `Bearer ${this._apiKey}`;
    }

    async listAll(
        opts?: IBackendListingOptions<IEmployeeSort>
    ): Promise<Array<IEmployee>> {
        // FIXME: Wrap for error handling
        // TODO: Validate opts
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            query: _listParams(opts),
        });
    }

    async countAll(): Promise<number> {
        // FIXME: Wrap for error handling
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: "/count",
        });
    }

    async getById(id: string): Promise<IEmployee | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}`,
        });
    }

    async search(
        filter: IEmployeeFilter,
        opts?: IBackendListingOptions<IEmployeeSort>
    ) {
        // FIXME: Wrap for error handling
        // TODO: Validate filter
        // TODO: Validate opts
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: "/search",
            query: _listParams(opts),
            body: filter,
        });
    }

    async countFor(filter: IEmployeeFilter): Promise<number> {
        // FIXME: Wrap for error handling
        // TODO: Validate filter
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: "/search/count",
            body: filter,
        });
    }

    async getFirstNameOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/first-name`,
        });
    }

    async getLastNameOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/last-name`,
        });
    }

    async getBirthDateOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/birth-date`,
        });
    }

    async getLastSeenAtOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/last-seen-at`,
        });
    }

    async getOrgUnitOf(id: string): Promise<IOrganizationUnit | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/org-unit`,
        });
    }

    async create(newEmployee: INewEmployee): Promise<IEmployee> {
        // FIXME: Wrap for error handling
        // TODO: Validate payload
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            body: newEmployee,
        });
    }
    async upsert(
        newOrUpdatedEntities: Array<IEmployee>
    ): Promise<Array<IEmployee>> {
        // FIXME: Wrap for error handling
        // TODO: Validate payload
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PUT",
            body: newOrUpdatedEntities,
        });
    }
    async fullUpdate(id: string, updatedEmployee: INewEmployee): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PUT",
            path: `/${id}`,
            body: updatedEmployee,
            noOp: true,
        });
    }
    async partialUpdate(
        id: string,
        updatedFields: Partial<INewEmployee>
    ): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PATCH",
            path: `/${id}`,
            body: updatedFields,
            noOp: true,
        });
    }
    async updateFirstName(id: string, firstName: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate firstName
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/first-name`,
            body: firstName,
            noOp: true,
        });
    }
    async updateLastName(id: string, lastName: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate lastName
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/last-name`,
            body: lastName,
            noOp: true,
        });
    }
    async updateBirthDate(id: string, birthDate: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate birthDate
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/birth-date`,
            body: birthDate,
            noOp: true,
        });
    }
    async updateLastSeenAt(id: string, lastSeenAt: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate lastSeenAt
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/last-seen-at`,
            body: lastSeenAt,
            noOp: true,
        });
    }
    async clearLastSeenAt(id: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "DELETE",
            path: `/${id}/last-seen-at`,
            noOp: true,
        });
    }
    async updateOrgUnit(id: string, orgUnit: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate orgUnit ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/org-unit`,
            body: orgUnit,
            noOp: true,
        });
    }
    async clearOrgUnit(id: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "DELETE",
            path: `/${id}/org-unit`,
            noOp: true,
        });
    }
    async remove(id: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "DELETE",
            path: `/${id}`,
            noOp: true,
        });
    }
}

export function createEmployeeService(
    opts: IBackendClientOptions
): IEmployeeService {
    return new EmployeeServiceImpl(opts);
}

/** No description. */
export interface IShift {
    /** The unique identifier for this Shift */
    id: string;

    /** No description. */
    beginsAt: string;

    /** No description. */
    endsAt: string;
}

/** DTO for a new Shift */
export interface INewShift {
    /** No description. */
    beginsAt?: string | null;

    /** No description. */
    endsAt?: string | null;
}

/** DTO for filtering Shift objects */
export interface IShiftFilter {
    and?: Array<IShiftFilter>;
    or?: Array<IShiftFilter>;
    not?: IShiftFilter;
    beginsAt?: {
        equals?: string;
        notEquals?: string;
        greaterThan?: string;
        lessThan?: string;
        greaterThanOrEquals?: string;
        lessThanOrEquals?: string;
    };
    endsAt?: {
        equals?: string;
        notEquals?: string;
        greaterThan?: string;
        lessThan?: string;
        greaterThanOrEquals?: string;
        lessThanOrEquals?: string;
    };
    id?: {
        equals?: string;
        notEquals?: string;
        in?: Array<string>;
        notIn?: Array<string>;
    };
}

export type IShiftSort =
    | "id__asc"
    | "id__desc"
    | "beginsAt__asc"
    | "beginsAt__desc"
    | "endsAt__asc"
    | "endsAt__desc";

export interface IShiftService {
    /**
     * List all Shift objects, optionally applying paging and sorting.
     * @param opts Options for paging and sorting
     * @returns A list of Shift objects
     */
    listAll(opts?: IBackendListingOptions<IShiftSort>): Promise<Array<IShift>>;

    /**
     * Get a Shift object by its unique identifier.
     * @param id The unique identifier of the Shift object
     * @returns The Shift object. Throws an error if not found.
     */
    getById(id: string): Promise<IShift>;

    /**
     * Count the total number of Shift objects.
     * @returns The total number of Shift objects
     */
    countAll(): Promise<number>;

    /**
     * Search for Shift objects using a filter, optionally applying paging and sorting.
     * @param filter The filter to apply
     * @param opts Options for paging and sorting
     * @returns A list of filtered Shift objects
     */
    search(filter: IShiftFilter, opts?: IBackendListingOptions<IShiftSort>);

    /**
     * Count the total number of Shift objects that match a filter.
     * @param filter The filter to apply
     * @returns The total number of Shift objects that match the filter
     */
    countFor(filter: IShiftFilter): Promise<number>;

    /**
     * Get the Begins At of a Shift object by its unique identifier.
     * @param id The unique identifier of the Shift object
     * @returns The Begins At of the given Shift object. Throws an error if the Shift object is not found.
     */
    getBeginsAtOf(id: string): Promise<string | null>;

    /**
     * Get the Ends At of a Shift object by its unique identifier.
     * @param id The unique identifier of the Shift object
     * @returns The Ends At of the given Shift object. Throws an error if the Shift object is not found.
     */
    getEndsAtOf(id: string): Promise<string | null>;

    /**
     * Create a new Shift object.
     * @param newShift The new Shift object to create
     * @returns The newly created Shift object
     */
    create(newShift: INewShift): Promise<IShift>;

    /**
     * Create or update a list of Shift objects. Each object will either be created or updated.
     * @param newOrUpdatedEntities The list of Shift objects to create or update
     * @returns The list of newly created or updated Shift objects
     */
    upsert(newOrUpdatedEntities: Array<IShift>): Promise<Array<IShift>>;

    /**
     * Update a Shift object by its unique identifier. Requires a value for ALL FIELDS of the object. Nulls will be interpreted as clearing the field. Missing fields will be nulls.
     * @param id The unique identifier of the Shift object
     * @param updatedShift The updated Shift object
     */
    fullUpdate(id: string, updatedShift: INewShift): Promise<void>;

    /**
     * Update a Shift object by its unique identifier. Requires a value for at least one field of the object. Nulls and missing fields will be ignored.
     * @param id The unique identifier of the Shift object
     * @param updatedFields The fields to update
     */
    partialUpdate(id: string, updatedFields: Partial<INewShift>): Promise<void>;

    /**
     * Update the beginsAt field of a Shift object by its unique identifier.
     * @param id The unique identifier of the Shift object
     * @param beginsAt The new value for the beginsAt field
     */
    updateBeginsAt(id: string, beginsAt: string): Promise<void>;

    /**
     * Update the endsAt field of a Shift object by its unique identifier.
     * @param id The unique identifier of the Shift object
     * @param endsAt The new value for the endsAt field
     */
    updateEndsAt(id: string, endsAt: string): Promise<void>;

    /**
     * Remove a Shift object by its unique identifier.
     * @param id The unique identifier of the Shift object
     */
    remove(id: string): Promise<void>;
}

class ShiftServiceImpl implements IShiftService {
    private _baseUrl: string = `http://localhost:8080/backend/v1/shift`;
    private _headers: Record<string, any> = {};
    private _apiKey: string;

    constructor(private _opts: IBackendClientOptions) {
        if (typeof _opts.baseUrl === "string") {
            this._baseUrl = `${_opts.baseUrl}/shift`;
        }
        if (typeof _opts.headers === "object") {
            this._headers = _opts.headers;
        }
        if (typeof _opts.apiKey !== "string") {
            throw new Error(
                `[ShiftService] An API key is required to use the Backend API`
            );
        }
        this._apiKey = _opts.apiKey;
        this._headers["Authorization"] = `Bearer ${this._apiKey}`;
    }

    async listAll(
        opts?: IBackendListingOptions<IShiftSort>
    ): Promise<Array<IShift>> {
        // FIXME: Wrap for error handling
        // TODO: Validate opts
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            query: _listParams(opts),
        });
    }

    async countAll(): Promise<number> {
        // FIXME: Wrap for error handling
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: "/count",
        });
    }

    async getById(id: string): Promise<IShift | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}`,
        });
    }

    async search(
        filter: IShiftFilter,
        opts?: IBackendListingOptions<IShiftSort>
    ) {
        // FIXME: Wrap for error handling
        // TODO: Validate filter
        // TODO: Validate opts
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: "/search",
            query: _listParams(opts),
            body: filter,
        });
    }

    async countFor(filter: IShiftFilter): Promise<number> {
        // FIXME: Wrap for error handling
        // TODO: Validate filter
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: "/search/count",
            body: filter,
        });
    }

    async getBeginsAtOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/begins-at`,
        });
    }

    async getEndsAtOf(id: string): Promise<string | null> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "GET",
            path: `/${id}/ends-at`,
        });
    }

    async create(newShift: INewShift): Promise<IShift> {
        // FIXME: Wrap for error handling
        // TODO: Validate payload
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            body: newShift,
        });
    }
    async upsert(newOrUpdatedEntities: Array<IShift>): Promise<Array<IShift>> {
        // FIXME: Wrap for error handling
        // TODO: Validate payload
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PUT",
            body: newOrUpdatedEntities,
        });
    }
    async fullUpdate(id: string, updatedShift: INewShift): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PUT",
            path: `/${id}`,
            body: updatedShift,
            noOp: true,
        });
    }
    async partialUpdate(
        id: string,
        updatedFields: Partial<INewShift>
    ): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "PATCH",
            path: `/${id}`,
            body: updatedFields,
            noOp: true,
        });
    }
    async updateBeginsAt(id: string, beginsAt: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate beginsAt
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/begins-at`,
            body: beginsAt,
            noOp: true,
        });
    }
    async updateEndsAt(id: string, endsAt: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        // TODO: Validate endsAt
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "POST",
            path: `/${id}/ends-at`,
            body: endsAt,
            noOp: true,
        });
    }
    async remove(id: string): Promise<void> {
        // FIXME: Wrap for error handling
        // TODO: Validate ID
        return await _makeRequest(this._baseUrl, this._headers, {
            method: "DELETE",
            path: `/${id}`,
            noOp: true,
        });
    }
}

export function createShiftService(opts: IBackendClientOptions): IShiftService {
    return new ShiftServiceImpl(opts);
}

export interface IBackendService {
    readonly organizationUnit: IOrganizationUnitService;
    readonly employee: IEmployeeService;
    readonly shift: IShiftService;
}

class BackendServiceImpl implements IBackendService {
    readonly organizationUnit: IOrganizationUnitService;
    readonly employee: IEmployeeService;
    readonly shift: IShiftService;

    constructor(private _opts: IBackendClientOptions) {
        this.organizationUnit = createOrganizationUnitService(_opts);
        this.employee = createEmployeeService(_opts);
        this.shift = createShiftService(_opts);
    }
}

export function createBackendService(
    opts: IBackendClientOptions
): IBackendService {
    return new BackendServiceImpl(opts);
}

export interface IBackendUserDetails {
    /**
     * ID of the user
     */
    id: string;
    /**
     * The user's login name
     */
    loginName: string;
    /**
     * The user's display name
     */
    displayName: string;
}

export interface IBackendLoginResult {
    /**
     * The user ID of the logged in user
     */
    userId: string;
    /**
     * Details about the logged in user
     */
    userDetails: IBackendUserDetails;
    /**
     * Options to pass to the client services to make them authenticated with the logged in user
     */
    clientOptions: IBackendClientOptions;
}

export interface IBackendAuthService {
    /**
     * Log in to the Backend API using a login name and password.
     * @param loginName The login name to log in with
     * @param password The password to log in with
     * @returns The result of the login, including the user ID, user details, and client options
     */
    login(loginName: string, password: string): Promise<IBackendLoginResult>;
}

class BackendAuthServiceImpl implements IBackendAuthService {
    constructor(
        private _baseUrl: string = `http://localhost:8080/backend/v1`
    ) {}

    async login(
        loginName: string,
        password: string
    ): Promise<IBackendLoginResult> {
        const token = await _makeRequest(
            this._baseUrl,
            {},
            {
                method: "POST",
                path: "/auth/login",
                body: { loginName, password },
                asText: true,
            }
        );
        const authenticatedHeaders = { Authorization: `Bearer ${token}` };
        const userDetails = await _makeRequest(
            this._baseUrl,
            authenticatedHeaders,
            { method: "GET", path: "/auth/me" }
        );
        return {
            userId: userDetails.id,
            userDetails,
            clientOptions: {
                baseUrl: this._baseUrl,
                headers: authenticatedHeaders,
                apiKey: token,
            },
        };
    }
}

export function createBackendAuthService(
    baseUrl: string = `http://localhost:8080/backend/v1`
): IBackendAuthService {
    return new BackendAuthServiceImpl(baseUrl);
}
