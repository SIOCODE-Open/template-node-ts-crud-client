const client = require("../lib/index");
const { expect } = require("chai");

function randomString(length = 15) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

function randomInteger(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoolean() {
    return Math.random() >= 0.5;
}

function randomFloat(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}

function randomDouble(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}

function randomLocalTime() {
    let randomHour = randomInteger(0, 23);
    let randomMinute = randomInteger(0, 59);
    let randomSecond = randomInteger(0, 59);
    return `${randomHour < 10 ? "0" : ""}${randomHour}:${
        randomMinute < 10 ? "0" : ""
    }${randomMinute}:${randomSecond < 10 ? "0" : ""}${randomSecond}`;
}

function randomLocalDate() {
    const oneYearMs = 1000 * 60 * 60 * 24 * 365;
    const randomMs = 2 * Math.floor(Math.random() * oneYearMs) - oneYearMs;
    const randomDate = new Date(Date.now() + randomMs);
    return randomDate.toISOString().split("T")[0];
}

function randomInstant() {
    return `${randomLocalDate()}T${randomLocalTime()}Z`;
}

function plusOneInteger(value) {
    return value + 1;
}

function plusOneDate(value) {
    const date = new Date(value);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
}

function plusOneLocalTime(value) {
    const parts = value.split(":");
    let hour = parseInt(parts[0]);
    let minute = parseInt(parts[1]);
    let second = parseInt(parts[2]);
    second++;
    if (second >= 60) {
        second = 0;
        minute++;
        if (minute >= 60) {
            minute = 0;
            hour++;
            if (hour >= 24) {
                hour = 0;
            }
        }
    }
    return `${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}:${
        second < 10 ? "0" : ""
    }${second}`;
}

function plusOneInstant(value) {
    const parts = value.split("T");
    const date = parts[0];
    const time = parts[1].split("Z")[0];
    const newTime = plusOneLocalTime(time);
    return `${date}T${newTime}Z`;
}

describe("Client Tests", () => {
    const backendUrl =
        process.env.CLIENT_TEST_BACKEND_URL ||
        `http://localhost:8080/backend/v1`;
    const authLoginName = process.env.CLIENT_TEST_AUTH_LOGIN_NAME || "admin";
    const authLoginPassword =
        process.env.CLIENT_TEST_AUTH_LOGIN_PASSWORD || "admin";
    const authJwtToken = process.env.CLIENT_TEST_AUTH_JWT_TOKEN || null;

    describe("Organization Unit Service Tests (http://localhost:8080/backend/v1/organization-unit)", () => {
        var clientOpts = null;

        const prepareClientOpts = async () => {
            if (clientOpts) {
                return;
            }

            if (!authLoginName || !authLoginPassword) {
                throw new Error(
                    "Cannot run tests: missing login credentials in test configuration (CLIENT_TEST_AUTH_LOGIN_NAME and CLIENT_TEST_AUTH_LOGIN_PASSWORD variables)"
                );
            }
            const authSvc = client.createBackendAuthService(backendUrl);
            const { clientOptions } = await authSvc.login(
                authLoginName,
                authLoginPassword
            );
            clientOpts = clientOptions;
        };

        const createService = async () => {
            await prepareClientOpts();
            return client.createOrganizationUnitService(clientOpts);
        };

        it("GET / (no opts)", async () => {
            const service = await createService();
            const list = await service.listAll();
            expect(list).to.be.an("array");
        });

        it("GET / (with opts)", async () => {
            const service = await createService();
            const list = await service.listAll({
                offset: 10,
                limit: 10,
                sort: "id__desc",
            });
            expect(list).to.be.an("array");
            expect(list.length).to.be.lessThanOrEqual(10);
        });

        it("GET /count", async () => {
            const service = await createService();
            const count = await service.countAll();
            expect(count).to.be.greaterThanOrEqual(0);
        });

        // New test: Create a new entity with random attributes and null associations
        it("POST / - create new Organization Unit with null associations", async () => {
            const service = await createService();
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            expect(createdOrganizationUnit).to.be.an("object");
            expect(createdOrganizationUnit).to.have.property("id");
            expect(createdOrganizationUnit).to.have.property(
                "name",
                newOrganizationUnit.name
            );
        });

        it("GET /:id", async () => {
            const service = await createService();
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            const retrievedOrganizationUnit = await service.getById(id);
            expect(retrievedOrganizationUnit).to.be.an("object");
            expect(retrievedOrganizationUnit).to.have.property("id", id);
        });

        // New test: Create a new entity with random attributes and non-null associations
        it("POST / - create new Organization Unit with non-null associations", async () => {
            const service = await createService();

            // Create related entities for associations
            const associations = {};

            const newOrganizationUnit = {
                name: randomString(),
                ...associations,
            };

            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            expect(createdOrganizationUnit).to.be.an("object");
            expect(createdOrganizationUnit).to.have.property("id");
            expect(createdOrganizationUnit).to.have.property(
                "name",
                newOrganizationUnit.name
            );
        });

        // Query the attribute value
        it("GET /:id/name - query attribute name", async () => {
            const service = await createService();
            // Create a new entity
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            // Retrieve the attribute value
            const value = await service.getNameOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdOrganizationUnit.name);
        });

        // Update an attribute with a random value
        it("POST /:id/name - update attribute name", async () => {
            const service = await createService();
            // Create a new entity
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            // Update the attribute
            const updatedValue = randomString();
            await service.updateName(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedOrganizationUnit = await service.getById(id);
            expect(updatedOrganizationUnit).to.have.property(
                "name",
                updatedValue
            );
        });

        it("DELETE /:id/name - clear attribute name", async () => {
            const service = await createService();
            // Create a new entity with the attribute set
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            // Clear the attribute
            await service.clearName(id); // Returns Promise<void>
            // Retrieve and verify the attribute is cleared
            const updatedOrganizationUnit = await service.getById(id);
            expect(updatedOrganizationUnit).to.have.property("name").that.is
                .null;
        });

        // Validation tests

        // Query the reverse association value
        it("GET /:id/employees - query reverse association employees", async () => {
            const service = await createService();
            // Create a new entity with the reverse association set
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );

            // Create related entity
            const relatedEmployeesService = await client.createEmployeeService(
                clientOpts
            );
            const relatedEmployees = await relatedEmployeesService.create({
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: createdOrganizationUnit.id,
            });

            const value = await service.getEmployeesOf(
                createdOrganizationUnit.id
            ); // Returns Promise<Employee[]>
            expect(value).to.be.an("array");
            expect(value.length).to.be.greaterThanOrEqual(1);
            const found = value.some((e) => e.id === relatedEmployees.id);
            expect(found).to.be.true;
        });

        // New test: Delete an entity
        it("DELETE /:id - remove Organization Unit", async () => {
            const service = await createService();
            // Create a new entity
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            // Delete the entity
            await service.remove(id);
            // Verify the entity has been deleted
            let error = null;
            try {
                await service.getById(id);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // New test: Search entities
        it("POST /search - search Organization Unit entities", async () => {
            const service = await createService();
            // Create a unique attribute value for testing
            const uniqueValue = `test-${randomString(5)}-${Date.now()}`;
            // Create a new entity with the unique value
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            // Search for the entity using the unique attribute
            const filter = {
                and: [
                    {
                        id: {
                            in: [createdOrganizationUnit.id],
                        },
                    },
                    {
                        id: {
                            notIn: [uniqueValue],
                        },
                    },
                ],
            };
            const results = await service.search(filter);
            expect(results).to.be.an("array");
            const found = results.some(
                (e) => e.id === createdOrganizationUnit.id
            );
            expect(found).to.be.true;
        });

        // New test: Count entities matching a filter
        it("POST /search/count - count Organization Unit entities matching a filter", async () => {
            const service = await createService();
            // Create a unique attribute value for testing
            const uniqueValue = `test-${randomString(5)}-${Date.now()}`;
            // Create a new entity with the unique value
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            // Count entities matching the filter
            const filter = {
                and: [
                    {
                        id: {
                            in: [createdOrganizationUnit.id],
                        },
                    },
                    {
                        id: {
                            notIn: [uniqueValue],
                        },
                    },
                ],
            };
            const count = await service.countFor(filter);
            expect(count).to.be.a("number");
            expect(count).to.be.greaterThanOrEqual(1);
        });

        // Perform a full update on an entity and check the updated values
        it("PUT /:id - full update Organization Unit", async () => {
            const service = await createService();
            // Create a new entity
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            // Update the entity
            const updatedOrganizationUnit = {
                id: id,
                name: randomString(),
            };
            await service.fullUpdate(id, updatedOrganizationUnit);
            // Retrieve and verify the updated entity
            const retrievedOrganizationUnit = await service.getById(id);
            expect(retrievedOrganizationUnit).to.be.an("object");
            expect(retrievedOrganizationUnit).to.have.property("id", id);
            expect(retrievedOrganizationUnit).to.have.property(
                "name",
                updatedOrganizationUnit.name
            );
        });

        // Perform a partial update on an entity and check the updated values
        it("PATCH /:id - partial update Organization Unit", async () => {
            const service = await createService();
            // Create a new entity
            const newOrganizationUnit = {
                name: randomString(),
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            const id = createdOrganizationUnit.id;
            // Update the entity
            const updatedOrganizationUnit = {
                id: id,
                name: randomString(),
            };
            await service.partialUpdate(id, updatedOrganizationUnit);
            // Retrieve and verify the updated entity
            const retrievedOrganizationUnit = await service.getById(id);
            expect(retrievedOrganizationUnit).to.be.an("object");
            expect(retrievedOrganizationUnit).to.have.property("id", id);
            expect(retrievedOrganizationUnit).to.have.property(
                "name",
                updatedOrganizationUnit.name
            );
        });
    });
    describe("Employee Service Tests (http://localhost:8080/backend/v1/employee)", () => {
        var clientOpts = null;

        const prepareClientOpts = async () => {
            if (clientOpts) {
                return;
            }

            if (!authLoginName || !authLoginPassword) {
                throw new Error(
                    "Cannot run tests: missing login credentials in test configuration (CLIENT_TEST_AUTH_LOGIN_NAME and CLIENT_TEST_AUTH_LOGIN_PASSWORD variables)"
                );
            }
            const authSvc = client.createBackendAuthService(backendUrl);
            const { clientOptions } = await authSvc.login(
                authLoginName,
                authLoginPassword
            );
            clientOpts = clientOptions;
        };

        const createService = async () => {
            await prepareClientOpts();
            return client.createEmployeeService(clientOpts);
        };

        it("GET / (no opts)", async () => {
            const service = await createService();
            const list = await service.listAll();
            expect(list).to.be.an("array");
        });

        it("GET / (with opts)", async () => {
            const service = await createService();
            const list = await service.listAll({
                offset: 10,
                limit: 10,
                sort: "id__desc",
            });
            expect(list).to.be.an("array");
            expect(list.length).to.be.lessThanOrEqual(10);
        });

        it("GET /count", async () => {
            const service = await createService();
            const count = await service.countAll();
            expect(count).to.be.greaterThanOrEqual(0);
        });

        // New test: Create a new entity with random attributes and null associations
        it("POST / - create new Employee with null associations", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnit: null,
            };
            const createdEmployee = await service.create(newEmployee);
            expect(createdEmployee).to.be.an("object");
            expect(createdEmployee).to.have.property("id");
            expect(createdEmployee).to.have.property(
                "firstName",
                newEmployee.firstName
            );
            expect(createdEmployee).to.have.property(
                "lastName",
                newEmployee.lastName
            );
            expect(createdEmployee).to.have.property(
                "birthDate",
                newEmployee.birthDate
            );
            expect(createdEmployee).to.have.property(
                "lastSeenAt",
                newEmployee.lastSeenAt
            );
        });

        it("GET /:id", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnit: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            const retrievedEmployee = await service.getById(id);
            expect(retrievedEmployee).to.be.an("object");
            expect(retrievedEmployee).to.have.property("id", id);
        });

        // New test: Create a new entity with random attributes and non-null associations
        it("POST / - create new Employee with non-null associations", async () => {
            const service = await createService();

            // Create related entities for associations
            const associations = {};
            // Assuming the associated entity is OrganizationUnit
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(clientOpts);
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            associations["orgUnitId"] = relatedOrgUnit.id;

            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                ...associations,
            };

            const createdEmployee = await service.create(newEmployee);
            expect(createdEmployee).to.be.an("object");
            expect(createdEmployee).to.have.property("id");
            expect(createdEmployee).to.have.property(
                "firstName",
                newEmployee.firstName
            );
            expect(createdEmployee).to.have.property(
                "lastName",
                newEmployee.lastName
            );
            expect(createdEmployee).to.have.property(
                "birthDate",
                newEmployee.birthDate
            );
            expect(createdEmployee).to.have.property(
                "lastSeenAt",
                newEmployee.lastSeenAt
            );
            expect(createdEmployee).to.have.property(
                "orgUnitId",
                associations["orgUnitId"]
            );
        });

        // Query the attribute value
        it("GET /:id/firstName - query attribute firstName", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Retrieve the attribute value
            const value = await service.getFirstNameOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdEmployee.firstName);
        });

        // Update an attribute with a random value
        it("POST /:id/firstName - update attribute firstName", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the attribute
            const updatedValue = randomString();
            await service.updateFirstName(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property("firstName", updatedValue);
        });

        // Validation tests

        it("POST / - create Employee with empty firstName (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
            };
            newEmployee.firstName = "";
            let error = null;
            try {
                await service.create(newEmployee);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("PUT /:id - full update Employee with empty firstName (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
            };
            const created = await service.create(newEmployee);
            const employeePatched = {
                ...created,
                firstName: "",
            };
            let error = null;
            try {
                await service.fullUpdate(created.id, employeePatched);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("POST /:id/firstName - update firstName with empty value (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const created = await service.create(newEmployee);
            let error = null;
            try {
                await service.updateFirstName(created.id, "");
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // Query the attribute value
        it("GET /:id/lastName - query attribute lastName", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Retrieve the attribute value
            const value = await service.getLastNameOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdEmployee.lastName);
        });

        // Update an attribute with a random value
        it("POST /:id/lastName - update attribute lastName", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the attribute
            const updatedValue = randomString();
            await service.updateLastName(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property("lastName", updatedValue);
        });

        // Validation tests

        it("POST / - create Employee with empty lastName (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
            };
            newEmployee.lastName = "";
            let error = null;
            try {
                await service.create(newEmployee);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("PUT /:id - full update Employee with empty lastName (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
            };
            const created = await service.create(newEmployee);
            const employeePatched = {
                ...created,
                lastName: "",
            };
            let error = null;
            try {
                await service.fullUpdate(created.id, employeePatched);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("POST /:id/lastName - update lastName with empty value (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const created = await service.create(newEmployee);
            let error = null;
            try {
                await service.updateLastName(created.id, "");
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // Query the attribute value
        it("GET /:id/birthDate - query attribute birthDate", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Retrieve the attribute value
            const value = await service.getBirthDateOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdEmployee.birthDate);
        });

        // Update an attribute with a random value
        it("POST /:id/birthDate - update attribute birthDate", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the attribute
            const updatedValue = randomLocalDate();
            await service.updateBirthDate(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property("birthDate", updatedValue);
        });

        // Validation tests

        it("POST / - create Employee with null birthDate (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
            };
            newEmployee.birthDate = null;
            let error = null;
            try {
                await service.create(newEmployee);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("PUT /:id - full update Employee with null birthDate (expect error)", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
            };
            const created = await service.create(newEmployee);
            const employeePatched = {
                ...created,
                birthDate: null,
            };
            let error = null;
            try {
                await service.fullUpdate(created.id, employeePatched);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // Query the attribute value
        it("GET /:id/lastSeenAt - query attribute lastSeenAt", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Retrieve the attribute value
            const value = await service.getLastSeenAtOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdEmployee.lastSeenAt);
        });

        // Update an attribute with a random value
        it("POST /:id/lastSeenAt - update attribute lastSeenAt", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the attribute
            const updatedValue = randomInstant();
            await service.updateLastSeenAt(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property(
                "lastSeenAt",
                updatedValue
            );
        });

        it("DELETE /:id/lastSeenAt - clear attribute lastSeenAt", async () => {
            const service = await createService();
            // Create a new entity with the attribute set
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Clear the attribute
            await service.clearLastSeenAt(id); // Returns Promise<void>
            // Retrieve and verify the attribute is cleared
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property("lastSeenAt").that.is.null;
        });

        // Validation tests

        // Query the association value
        it("GET /:id/orgUnit - query association orgUnit", async () => {
            const service = await createService();
            // Create related entity
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(clientOpts);
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            // Create a new entity with the association set
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: relatedOrgUnit.id,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Retrieve the association value
            const value = await service.getOrgUnitOf(id); // Returns Promise<OrganizationUnit>
            expect(value).to.be.an("object");
            expect(value).to.have.property("id", relatedOrgUnit.id);
        });

        // Update an association with null and non-null values
        it("POST /:id/orgUnit - update association orgUnit with non-null value", async () => {
            const service = await createService();
            // Create related entity
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(clientOpts);
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the association
            await service.updateOrgUnit(id, relatedOrgUnit.id); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property(
                "orgUnitId",
                relatedOrgUnit.id
            );
        });

        it("DELETE /:id/orgUnit - clear association orgUnit", async () => {
            const service = await createService();
            // Create related entity
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(clientOpts);
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            // Create a new entity with the association set
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: relatedOrgUnit.id,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Clear the association
            await service.clearOrgUnit(id); // Returns Promise<void>
            // Retrieve and verify the association is cleared
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee["orgUnitId"]).to.be.null;
        });

        // New test: Delete an entity
        it("DELETE /:id - remove Employee", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Delete the entity
            await service.remove(id);
            // Verify the entity has been deleted
            let error = null;
            try {
                await service.getById(id);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // New test: Search entities
        it("POST /search - search Employee entities", async () => {
            const service = await createService();
            // Create a unique attribute value for testing
            const uniqueValue = `test-${randomString(5)}-${Date.now()}`;
            // Create a new entity with the unique value
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            // Search for the entity using the unique attribute
            const filter = {
                and: [
                    {
                        id: {
                            in: [createdEmployee.id],
                        },
                    },
                    {
                        id: {
                            notIn: [uniqueValue],
                        },
                    },
                ],
            };
            const results = await service.search(filter);
            expect(results).to.be.an("array");
            const found = results.some((e) => e.id === createdEmployee.id);
            expect(found).to.be.true;
        });

        // New test: Count entities matching a filter
        it("POST /search/count - count Employee entities matching a filter", async () => {
            const service = await createService();
            // Create a unique attribute value for testing
            const uniqueValue = `test-${randomString(5)}-${Date.now()}`;
            // Create a new entity with the unique value
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            // Count entities matching the filter
            const filter = {
                and: [
                    {
                        id: {
                            in: [createdEmployee.id],
                        },
                    },
                    {
                        id: {
                            notIn: [uniqueValue],
                        },
                    },
                ],
            };
            const count = await service.countFor(filter);
            expect(count).to.be.a("number");
            expect(count).to.be.greaterThanOrEqual(1);
        });

        // Perform a full update on an entity and check the updated values
        it("PUT /:id - full update Employee", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(clientOpts);
            const relatedOrgUnits = [
                await relatedOrgUnitService.create({
                    name: randomString(),
                }),
                await relatedOrgUnitService.create({
                    name: randomString(),
                }),
            ];
            newEmployee.orgUnitId = relatedOrgUnits[0].id;
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the entity
            const updatedEmployee = {
                id: id,
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: relatedOrgUnits[1].id,
            };
            await service.fullUpdate(id, updatedEmployee);
            // Retrieve and verify the updated entity
            const retrievedEmployee = await service.getById(id);
            expect(retrievedEmployee).to.be.an("object");
            expect(retrievedEmployee).to.have.property("id", id);
            expect(retrievedEmployee).to.have.property(
                "firstName",
                updatedEmployee.firstName
            );
            expect(retrievedEmployee).to.have.property(
                "lastName",
                updatedEmployee.lastName
            );
            expect(retrievedEmployee).to.have.property(
                "birthDate",
                updatedEmployee.birthDate
            );
            expect(retrievedEmployee).to.have.property(
                "lastSeenAt",
                updatedEmployee.lastSeenAt
            );
            expect(retrievedEmployee).to.have.property(
                "orgUnitId",
                updatedEmployee.orgUnitId
            );
        });

        // Perform a partial update on an entity and check the updated values
        it("PATCH /:id - partial update Employee", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: null,
            };
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(clientOpts);
            const relatedOrgUnits = [
                await relatedOrgUnitService.create({
                    name: randomString(),
                }),
                await relatedOrgUnitService.create({
                    name: randomString(),
                }),
            ];
            newEmployee.orgUnitId = relatedOrgUnits[0].id;
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Update the entity
            const updatedEmployee = {
                id: id,
                firstName: randomString(),
                lastName: randomString(),
                birthDate: randomLocalDate(),
                lastSeenAt: randomInstant(),
                orgUnitId: relatedOrgUnits[1].id,
            };
            await service.partialUpdate(id, updatedEmployee);
            // Retrieve and verify the updated entity
            const retrievedEmployee = await service.getById(id);
            expect(retrievedEmployee).to.be.an("object");
            expect(retrievedEmployee).to.have.property("id", id);
            expect(retrievedEmployee).to.have.property(
                "firstName",
                updatedEmployee.firstName
            );
            expect(retrievedEmployee).to.have.property(
                "lastName",
                updatedEmployee.lastName
            );
            expect(retrievedEmployee).to.have.property(
                "birthDate",
                updatedEmployee.birthDate
            );
            expect(retrievedEmployee).to.have.property(
                "lastSeenAt",
                updatedEmployee.lastSeenAt
            );
            expect(retrievedEmployee).to.have.property(
                "orgUnitId",
                updatedEmployee.orgUnitId
            );
        });
    });
    describe("Shift Service Tests (http://localhost:8080/backend/v1/shift)", () => {
        var clientOpts = null;

        const prepareClientOpts = async () => {
            if (clientOpts) {
                return;
            }

            if (!authLoginName || !authLoginPassword) {
                throw new Error(
                    "Cannot run tests: missing login credentials in test configuration (CLIENT_TEST_AUTH_LOGIN_NAME and CLIENT_TEST_AUTH_LOGIN_PASSWORD variables)"
                );
            }
            const authSvc = client.createBackendAuthService(backendUrl);
            const { clientOptions } = await authSvc.login(
                authLoginName,
                authLoginPassword
            );
            clientOpts = clientOptions;
        };

        const createService = async () => {
            await prepareClientOpts();
            return client.createShiftService(clientOpts);
        };

        it("GET / (no opts)", async () => {
            const service = await createService();
            const list = await service.listAll();
            expect(list).to.be.an("array");
        });

        it("GET / (with opts)", async () => {
            const service = await createService();
            const list = await service.listAll({
                offset: 10,
                limit: 10,
                sort: "id__desc",
            });
            expect(list).to.be.an("array");
            expect(list.length).to.be.lessThanOrEqual(10);
        });

        it("GET /count", async () => {
            const service = await createService();
            const count = await service.countAll();
            expect(count).to.be.greaterThanOrEqual(0);
        });

        // New test: Create a new entity with random attributes and null associations
        it("POST / - create new Shift with null associations", async () => {
            const service = await createService();
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            expect(createdShift).to.be.an("object");
            expect(createdShift).to.have.property("id");
            expect(createdShift).to.have.property(
                "beginsAt",
                newShift.beginsAt
            );
            expect(createdShift).to.have.property("endsAt", newShift.endsAt);
        });

        it("GET /:id", async () => {
            const service = await createService();
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            const retrievedShift = await service.getById(id);
            expect(retrievedShift).to.be.an("object");
            expect(retrievedShift).to.have.property("id", id);
        });

        // New test: Create a new entity with random attributes and non-null associations
        it("POST / - create new Shift with non-null associations", async () => {
            const service = await createService();

            // Create related entities for associations
            const associations = {};

            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
                ...associations,
            };

            const createdShift = await service.create(newShift);
            expect(createdShift).to.be.an("object");
            expect(createdShift).to.have.property("id");
            expect(createdShift).to.have.property(
                "beginsAt",
                newShift.beginsAt
            );
            expect(createdShift).to.have.property("endsAt", newShift.endsAt);
        });

        // Query the attribute value
        it("GET /:id/beginsAt - query attribute beginsAt", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Retrieve the attribute value
            const value = await service.getBeginsAtOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdShift.beginsAt);
        });

        // Update an attribute with a random value
        it("POST /:id/beginsAt - update attribute beginsAt", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Update the attribute
            const updatedValue = randomLocalTime();
            await service.updateBeginsAt(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedShift = await service.getById(id);
            expect(updatedShift).to.have.property("beginsAt", updatedValue);
        });

        // Validation tests

        it("POST / - create Shift with null beginsAt (expect error)", async () => {
            const service = await createService();
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            newShift.beginsAt = null;
            let error = null;
            try {
                await service.create(newShift);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("PUT /:id - full update Shift with null beginsAt (expect error)", async () => {
            const service = await createService();
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const created = await service.create(newShift);
            const shiftPatched = {
                ...created,
                beginsAt: null,
            };
            let error = null;
            try {
                await service.fullUpdate(created.id, shiftPatched);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // Query the attribute value
        it("GET /:id/endsAt - query attribute endsAt", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Retrieve the attribute value
            const value = await service.getEndsAtOf(id); // Returns Promise<string>
            expect(value).to.be.a("string");
            expect(value).to.equal(createdShift.endsAt);
        });

        // Update an attribute with a random value
        it("POST /:id/endsAt - update attribute endsAt", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Update the attribute
            const updatedValue = randomLocalTime();
            await service.updateEndsAt(id, updatedValue); // Returns Promise<void>
            // Retrieve and verify the updated entity
            const updatedShift = await service.getById(id);
            expect(updatedShift).to.have.property("endsAt", updatedValue);
        });

        // Validation tests

        it("POST / - create Shift with null endsAt (expect error)", async () => {
            const service = await createService();
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            newShift.endsAt = null;
            let error = null;
            try {
                await service.create(newShift);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        it("PUT /:id - full update Shift with null endsAt (expect error)", async () => {
            const service = await createService();
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const created = await service.create(newShift);
            const shiftPatched = {
                ...created,
                endsAt: null,
            };
            let error = null;
            try {
                await service.fullUpdate(created.id, shiftPatched);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // New test: Delete an entity
        it("DELETE /:id - remove Shift", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Delete the entity
            await service.remove(id);
            // Verify the entity has been deleted
            let error = null;
            try {
                await service.getById(id);
            } catch (err) {
                error = err;
            }
            expect(error).to.not.be.null;
        });

        // New test: Search entities
        it("POST /search - search Shift entities", async () => {
            const service = await createService();
            // Create a unique attribute value for testing
            const uniqueValue = `test-${randomString(5)}-${Date.now()}`;
            // Create a new entity with the unique value
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            // Search for the entity using the unique attribute
            const filter = {
                and: [
                    {
                        id: {
                            in: [createdShift.id],
                        },
                    },
                    {
                        id: {
                            notIn: [uniqueValue],
                        },
                    },
                ],
            };
            const results = await service.search(filter);
            expect(results).to.be.an("array");
            const found = results.some((e) => e.id === createdShift.id);
            expect(found).to.be.true;
        });

        // New test: Count entities matching a filter
        it("POST /search/count - count Shift entities matching a filter", async () => {
            const service = await createService();
            // Create a unique attribute value for testing
            const uniqueValue = `test-${randomString(5)}-${Date.now()}`;
            // Create a new entity with the unique value
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            // Count entities matching the filter
            const filter = {
                and: [
                    {
                        id: {
                            in: [createdShift.id],
                        },
                    },
                    {
                        id: {
                            notIn: [uniqueValue],
                        },
                    },
                ],
            };
            const count = await service.countFor(filter);
            expect(count).to.be.a("number");
            expect(count).to.be.greaterThanOrEqual(1);
        });

        // Perform a full update on an entity and check the updated values
        it("PUT /:id - full update Shift", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Update the entity
            const updatedShift = {
                id: id,
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            await service.fullUpdate(id, updatedShift);
            // Retrieve and verify the updated entity
            const retrievedShift = await service.getById(id);
            expect(retrievedShift).to.be.an("object");
            expect(retrievedShift).to.have.property("id", id);
            expect(retrievedShift).to.have.property(
                "beginsAt",
                updatedShift.beginsAt
            );
            expect(retrievedShift).to.have.property(
                "endsAt",
                updatedShift.endsAt
            );
        });

        // Perform a partial update on an entity and check the updated values
        it("PATCH /:id - partial update Shift", async () => {
            const service = await createService();
            // Create a new entity
            const newShift = {
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            const createdShift = await service.create(newShift);
            const id = createdShift.id;
            // Update the entity
            const updatedShift = {
                id: id,
                beginsAt: randomLocalTime(),
                endsAt: randomLocalTime(),
            };
            await service.partialUpdate(id, updatedShift);
            // Retrieve and verify the updated entity
            const retrievedShift = await service.getById(id);
            expect(retrievedShift).to.be.an("object");
            expect(retrievedShift).to.have.property("id", id);
            expect(retrievedShift).to.have.property(
                "beginsAt",
                updatedShift.beginsAt
            );
            expect(retrievedShift).to.have.property(
                "endsAt",
                updatedShift.endsAt
            );
        });
    });
});
