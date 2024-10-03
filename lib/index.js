"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationUnitService = createOrganizationUnitService;
exports.createEmployeeService = createEmployeeService;
exports.createShiftService = createShiftService;
exports.createBackendService = createBackendService;
exports.createBackendAuthService = createBackendAuthService;
/**
 * Helper function to create the listing query parameter string from the listing client parameters object.
 * @param listParams The listing client parameters object
 * @returns The query parameter string
 */
function _listParams(listParams) {
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
function _makeRequest(baseUrl, headers, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        let queryString = "";
        if (typeof opts.query === "string" && opts.query.length > 0) {
            if (opts.query.startsWith("?")) {
                queryString = opts.query;
            }
            else {
                queryString = `?${opts.query}`;
            }
        }
        let response = null;
        try {
            response = yield fetch(`${baseUrl}${opts.path || ""}${queryString}`, {
                method: opts.method,
                headers: Object.assign({ "Content-Type": "application/json", Accept: "application/json" }, headers),
                body: JSON.stringify(opts.body),
            });
        }
        catch (err) {
            // FIXME: Better client error handling
            throw new Error(`Fetch failed (host probably down) ${opts.method} ${opts.path || "/"} @ ${baseUrl}: ${err}`);
        }
        if (!response.ok) {
            // FIXME: Better client error handling
            throw new Error(`Failed calling ${opts.method} ${opts.path || "/"} @ ${baseUrl}: ${response.status} ${response.statusText}`);
        }
        if (opts.noOp) {
            return { ok: true };
        }
        if (opts.asText) {
            return yield response.text();
        }
        return yield response.json();
    });
}
class OrganizationUnitServiceImpl {
    constructor(_opts) {
        this._opts = _opts;
        this._baseUrl = `http://localhost:8080/backend/v1/organization-unit`;
        this._headers = {};
        if (typeof _opts.baseUrl === "string") {
            this._baseUrl = `${_opts.baseUrl}/organization-unit`;
        }
        if (typeof _opts.headers === "object") {
            this._headers = _opts.headers;
        }
        if (typeof _opts.apiKey !== "string") {
            throw new Error(`[OrganizationUnitService] An API key is required to use the Backend API`);
        }
        this._apiKey = _opts.apiKey;
        this._headers["Authorization"] = `Bearer ${this._apiKey}`;
    }
    listAll(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate opts
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                query: _listParams(opts),
            });
        });
    }
    countAll() {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: "/count",
            });
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: `/${id}`,
            });
        });
    }
    search(filter, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate filter
            // TODO: Validate opts
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: "/search",
                query: _listParams(opts),
                body: filter,
            });
        });
    }
    countFor(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate filter
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: "/search/count",
                body: filter,
            });
        });
    }
    getEmployeesOf(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: `/${id}/employees`,
            });
        });
    }
    create(newOrganizationUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate payload
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                body: newOrganizationUnit,
            });
        });
    }
    upsert(newOrUpdatedEntities) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate payload
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PUT",
                body: newOrUpdatedEntities,
            });
        });
    }
    fullUpdate(id, updatedOrganizationUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PUT",
                path: `/${id}`,
                body: updatedOrganizationUnit,
                noOp: true,
            });
        });
    }
    partialUpdate(id, updatedFields) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PATCH",
                path: `/${id}`,
                body: updatedFields,
                noOp: true,
            });
        });
    }
    updateName(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate name
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/name`,
                body: name,
                noOp: true,
            });
        });
    }
    clearName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "DELETE",
                path: `/${id}/name`,
                noOp: true,
            });
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "DELETE",
                path: `/${id}`,
                noOp: true,
            });
        });
    }
}
function createOrganizationUnitService(opts) {
    return new OrganizationUnitServiceImpl(opts);
}
class EmployeeServiceImpl {
    constructor(_opts) {
        this._opts = _opts;
        this._baseUrl = `http://localhost:8080/backend/v1/employee`;
        this._headers = {};
        if (typeof _opts.baseUrl === "string") {
            this._baseUrl = `${_opts.baseUrl}/employee`;
        }
        if (typeof _opts.headers === "object") {
            this._headers = _opts.headers;
        }
        if (typeof _opts.apiKey !== "string") {
            throw new Error(`[EmployeeService] An API key is required to use the Backend API`);
        }
        this._apiKey = _opts.apiKey;
        this._headers["Authorization"] = `Bearer ${this._apiKey}`;
    }
    listAll(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate opts
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                query: _listParams(opts),
            });
        });
    }
    countAll() {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: "/count",
            });
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: `/${id}`,
            });
        });
    }
    search(filter, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate filter
            // TODO: Validate opts
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: "/search",
                query: _listParams(opts),
                body: filter,
            });
        });
    }
    countFor(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate filter
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: "/search/count",
                body: filter,
            });
        });
    }
    getOrgUnitOf(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: `/${id}/org-unit`,
            });
        });
    }
    create(newEmployee) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate payload
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                body: newEmployee,
            });
        });
    }
    upsert(newOrUpdatedEntities) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate payload
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PUT",
                body: newOrUpdatedEntities,
            });
        });
    }
    fullUpdate(id, updatedEmployee) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PUT",
                path: `/${id}`,
                body: updatedEmployee,
                noOp: true,
            });
        });
    }
    partialUpdate(id, updatedFields) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PATCH",
                path: `/${id}`,
                body: updatedFields,
                noOp: true,
            });
        });
    }
    updateFirstName(id, firstName) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate firstName
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/first-name`,
                body: firstName,
                noOp: true,
            });
        });
    }
    updateLastName(id, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate lastName
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/last-name`,
                body: lastName,
                noOp: true,
            });
        });
    }
    updateBirthDate(id, birthDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate birthDate
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/birth-date`,
                body: birthDate,
                noOp: true,
            });
        });
    }
    updateLastSeenAt(id, lastSeenAt) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate lastSeenAt
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/last-seen-at`,
                body: lastSeenAt,
                noOp: true,
            });
        });
    }
    clearLastSeenAt(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "DELETE",
                path: `/${id}/last-seen-at`,
                noOp: true,
            });
        });
    }
    updateOrgUnit(id, orgUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate orgUnit ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/org-unit`,
                body: orgUnit,
                noOp: true,
            });
        });
    }
    clearOrgUnit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "DELETE",
                path: `/${id}/org-unit`,
                noOp: true,
            });
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "DELETE",
                path: `/${id}`,
                noOp: true,
            });
        });
    }
}
function createEmployeeService(opts) {
    return new EmployeeServiceImpl(opts);
}
class ShiftServiceImpl {
    constructor(_opts) {
        this._opts = _opts;
        this._baseUrl = `http://localhost:8080/backend/v1/shift`;
        this._headers = {};
        if (typeof _opts.baseUrl === "string") {
            this._baseUrl = `${_opts.baseUrl}/shift`;
        }
        if (typeof _opts.headers === "object") {
            this._headers = _opts.headers;
        }
        if (typeof _opts.apiKey !== "string") {
            throw new Error(`[ShiftService] An API key is required to use the Backend API`);
        }
        this._apiKey = _opts.apiKey;
        this._headers["Authorization"] = `Bearer ${this._apiKey}`;
    }
    listAll(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate opts
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                query: _listParams(opts),
            });
        });
    }
    countAll() {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: "/count",
            });
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "GET",
                path: `/${id}`,
            });
        });
    }
    search(filter, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate filter
            // TODO: Validate opts
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: "/search",
                query: _listParams(opts),
                body: filter,
            });
        });
    }
    countFor(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate filter
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: "/search/count",
                body: filter,
            });
        });
    }
    create(newShift) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate payload
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                body: newShift,
            });
        });
    }
    upsert(newOrUpdatedEntities) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate payload
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PUT",
                body: newOrUpdatedEntities,
            });
        });
    }
    fullUpdate(id, updatedShift) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PUT",
                path: `/${id}`,
                body: updatedShift,
                noOp: true,
            });
        });
    }
    partialUpdate(id, updatedFields) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "PATCH",
                path: `/${id}`,
                body: updatedFields,
                noOp: true,
            });
        });
    }
    updateBeginsAt(id, beginsAt) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate beginsAt
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/begins-at`,
                body: beginsAt,
                noOp: true,
            });
        });
    }
    updateEndsAt(id, endsAt) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            // TODO: Validate endsAt
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "POST",
                path: `/${id}/ends-at`,
                body: endsAt,
                noOp: true,
            });
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: Wrap for error handling
            // TODO: Validate ID
            return yield _makeRequest(this._baseUrl, this._headers, {
                method: "DELETE",
                path: `/${id}`,
                noOp: true,
            });
        });
    }
}
function createShiftService(opts) {
    return new ShiftServiceImpl(opts);
}
class BackendServiceImpl {
    constructor(_opts) {
        this._opts = _opts;
        this.organizationUnit = createOrganizationUnitService(_opts);
        this.employee = createEmployeeService(_opts);
        this.shift = createShiftService(_opts);
    }
}
function createBackendService(opts) {
    return new BackendServiceImpl(opts);
}
class BackendAuthServiceImpl {
    constructor(_baseUrl = `http://localhost:8080/backend/v1`) {
        this._baseUrl = _baseUrl;
    }
    login(loginName, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield _makeRequest(this._baseUrl, {}, {
                method: "POST",
                path: "/auth/login",
                body: { loginName, password },
                asText: true,
            });
            const authenticatedHeaders = { Authorization: `Bearer ${token}` };
            const userDetails = yield _makeRequest(this._baseUrl, authenticatedHeaders, { method: "GET", path: "/auth/me" });
            return {
                userId: userDetails.id,
                userDetails,
                clientOptions: {
                    baseUrl: this._baseUrl,
                    headers: authenticatedHeaders,
                    apiKey: token,
                },
            };
        });
    }
}
function createBackendAuthService(baseUrl = `http://localhost:8080/backend/v1`) {
    return new BackendAuthServiceImpl(baseUrl);
}
//# sourceMappingURL=index.js.map