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
class OrganizationUnitServiceImpl {
    constructor(_baseUrl = "http://localhost:8080/backend/v1", _headers = {}) {
        this._baseUrl = _baseUrl;
        this._headers = _headers;
    }
    listAll(opts) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield fetch(requestUrl, {
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling GET ${requestUrl}: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    countAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/organization-unit/count`, {
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling GET ${this._baseUrl}/organization-unit/count: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/organization-unit/${id}`, {
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling GET ${this._baseUrl}/organization-unit/${id}: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    search(filter, opts) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield fetch(requestUrl, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(filter),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    countFor(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/organization-unit/search/count`, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(filter),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling POST ${this._baseUrl}/organization-unit/search/count: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    create(newOrganizationUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/organization-unit`, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(newOrganizationUnit),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling POST ${this._baseUrl}/organization-unit: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    updateName(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/organization-unit/${id}/name`;
            const response = yield fetch(requestUrl, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(name),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    clearName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/organization-unit/${id}/name`;
            const response = yield fetch(requestUrl, {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
                body: JSON.stringify(""),
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/organization-unit/${id}`, {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[OrganizationUnitService] Failed calling DELETE ${this._baseUrl}/organization-unit/${id}: ${response.status} ${response.statusText}`);
            }
        });
    }
}
function createOrganizationUnitService(baseUrl = "http://localhost:8080/backend/v1", headers = {}) {
    return new OrganizationUnitServiceImpl(baseUrl, headers);
}
class EmployeeServiceImpl {
    constructor(_baseUrl = "http://localhost:8080/backend/v1", _headers = {}) {
        this._baseUrl = _baseUrl;
        this._headers = _headers;
    }
    listAll(opts) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield fetch(requestUrl, {
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling GET ${requestUrl}: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    countAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/employee/count`, {
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling GET ${this._baseUrl}/employee/count: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/employee/${id}`, {
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling GET ${this._baseUrl}/employee/${id}: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    search(filter, opts) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield fetch(requestUrl, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(filter),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    countFor(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/employee/search/count`, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(filter),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling POST ${this._baseUrl}/employee/search/count: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    create(newEmployee) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/employee`, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(newEmployee),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling POST ${this._baseUrl}/employee: ${response.status} ${response.statusText}`);
            }
            return yield response.json();
        });
    }
    updateFirstName(id, firstName) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/employee/${id}/first-name`;
            const response = yield fetch(requestUrl, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(firstName),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    clearFirstName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/employee/${id}/first-name`;
            const response = yield fetch(requestUrl, {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
                body: JSON.stringify(""),
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    updateLastName(id, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/employee/${id}/last-name`;
            const response = yield fetch(requestUrl, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(lastName),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    clearLastName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/employee/${id}/last-name`;
            const response = yield fetch(requestUrl, {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
                body: JSON.stringify(""),
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    updateOrgUnit(id, orgUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/employee/${id}/org-unit`;
            const response = yield fetch(requestUrl, {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
                body: JSON.stringify(orgUnit),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling POST ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    clearOrgUnit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = `${this._baseUrl}/employee/${id}/org-unit`;
            const response = yield fetch(requestUrl, {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
                body: JSON.stringify(""),
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling DELETE ${requestUrl}: ${response.status} ${response.statusText}`);
            }
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this._baseUrl}/employee/${id}`, {
                method: "DELETE",
                headers: this._headers,
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`[EmployeeService] Failed calling DELETE ${this._baseUrl}/employee/${id}: ${response.status} ${response.statusText}`);
            }
        });
    }
}
function createEmployeeService(baseUrl = "http://localhost:8080/backend/v1", headers = {}) {
    return new EmployeeServiceImpl(baseUrl, headers);
}
//# sourceMappingURL=index.js.map