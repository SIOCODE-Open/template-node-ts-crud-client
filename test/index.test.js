const client = require("../lib/index");
const { expect } = require("chai");

function randomString(length = 10) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

function randomInteger(min = 0, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoolean() {
    return Math.random() >= 0.5;
}

function randomFloat(min = 0, max = 1000) {
    return Math.random() * (max - min) + min;
}

function randomDouble(min = 0, max = 1000) {
    return Math.random() * (max - min) + min;
}

describe("Backend Client Node Tests", () => {
    const backendUrl =
        process.env.BACKEND_CLIENT_NODE_TEST_BACKEND_URL ||
        "http://localhost:8080/backend/v1";
    const authLoginName =
        process.env.BACKEND_CLIENT_NODE_TEST_AUTH_LOGIN_NAME || "admin";
    const authLoginPassword =
        process.env.BACKEND_CLIENT_NODE_TEST_AUTH_LOGIN_PASSWORD || "admin";
    const authJwtToken =
        process.env.BACKEND_CLIENT_NODE_TEST_AUTH_JWT_TOKEN || null;

    describe("Organization Unit Service Tests (/backend/v1/organization-unit)", () => {
        var authToken = null;

        const doLogin = async () => {
            if (authJwtToken) {
                authToken = authJwtToken;
                console.log(
                    "Using JWT token from configuration for authentication, skipping login ..."
                );
                return authToken;
            }

            try {
                const loginResponse = await fetch(`${backendUrl}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        loginName: authLoginName,
                        password: authLoginPassword,
                    }),
                });
                if (!loginResponse.ok) {
                    throw new Error(
                        "Cannot run tests: login endpoint returned status " +
                            loginResponse.status +
                            " " +
                            loginResponse.statusText
                    );
                }
                // Token is raw the body
                authToken = await loginResponse.text();
                return authToken;
            } catch (error) {
                const isConnRefused = error.message.includes("ECONNREFUSED");
                if (isConnRefused) {
                    throw new Error(
                        [error],
                        "Cannot run tests: connection refused. Is the backend running?"
                    );
                }
                throw new AggregateError(
                    [error],
                    "Cannot run tests: login failed with error " + error.message
                );
            }
        };

        const createService = async () => {
            const token = await doLogin();
            return client.createOrganizationUnitService(backendUrl, {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            });
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

        // New test: Update an attribute with a random value
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

        // New test: Clear an attribute
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

        // New test: Update an association with null and non-null values

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
                name: uniqueValue,
            };
            const createdOrganizationUnit = await service.create(
                newOrganizationUnit
            );
            // Search for the entity using the unique attribute
            const filter = {
                name: {
                    equals: uniqueValue,
                },
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
                name: uniqueValue,
            };
            await service.create(newOrganizationUnit);
            // Count entities matching the filter
            const filter = {
                name: {
                    equals: uniqueValue,
                },
            };
            const count = await service.countFor(filter);
            expect(count).to.be.a("number");
            expect(count).to.be.greaterThanOrEqual(1);
        });
    });
    describe("Employee Service Tests (/backend/v1/employee)", () => {
        var authToken = null;

        const doLogin = async () => {
            if (authJwtToken) {
                authToken = authJwtToken;
                console.log(
                    "Using JWT token from configuration for authentication, skipping login ..."
                );
                return authToken;
            }

            try {
                const loginResponse = await fetch(`${backendUrl}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        loginName: authLoginName,
                        password: authLoginPassword,
                    }),
                });
                if (!loginResponse.ok) {
                    throw new Error(
                        "Cannot run tests: login endpoint returned status " +
                            loginResponse.status +
                            " " +
                            loginResponse.statusText
                    );
                }
                // Token is raw the body
                authToken = await loginResponse.text();
                return authToken;
            } catch (error) {
                const isConnRefused = error.message.includes("ECONNREFUSED");
                if (isConnRefused) {
                    throw new Error(
                        [error],
                        "Cannot run tests: connection refused. Is the backend running?"
                    );
                }
                throw new AggregateError(
                    [error],
                    "Cannot run tests: login failed with error " + error.message
                );
            }
        };

        const createService = async () => {
            const token = await doLogin();
            return client.createEmployeeService(backendUrl, {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            });
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
        });

        it("GET /:id", async () => {
            const service = await createService();
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
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
                await client.createOrganizationUnitService(backendUrl, {
                    Authorization: `Bearer ${authToken}`,
                });
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            associations["orgUnitId"] = relatedOrgUnit.id;

            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
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
                "orgUnitId",
                associations["orgUnitId"]
            );
        });

        // New test: Update an attribute with a random value
        it("POST /:id/firstName - update attribute firstName", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
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
        it("POST /:id/lastName - update attribute lastName", async () => {
            const service = await createService();
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
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

        // New test: Clear an attribute
        it("DELETE /:id/firstName - clear attribute firstName", async () => {
            const service = await createService();
            // Create a new entity with the attribute set
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Clear the attribute
            await service.clearFirstName(id); // Returns Promise<void>
            // Retrieve and verify the attribute is cleared
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property("firstName").that.is.null;
        });
        it("DELETE /:id/lastName - clear attribute lastName", async () => {
            const service = await createService();
            // Create a new entity with the attribute set
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            const id = createdEmployee.id;
            // Clear the attribute
            await service.clearLastName(id); // Returns Promise<void>
            // Retrieve and verify the attribute is cleared
            const updatedEmployee = await service.getById(id);
            expect(updatedEmployee).to.have.property("lastName").that.is.null;
        });

        // New test: Update an association with null and non-null values
        it("POST /:id/orgUnit - update association orgUnit with non-null value", async () => {
            const service = await createService();
            // Create related entity
            const relatedOrgUnitService =
                await client.createOrganizationUnitService(backendUrl, {
                    Authorization: `Bearer ${authToken}`,
                });
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            // Create a new entity
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
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
                await client.createOrganizationUnitService(backendUrl, {
                    Authorization: `Bearer ${authToken}`,
                });
            const relatedOrgUnit = await relatedOrgUnitService.create({
                name: randomString(),
            });
            // Create a new entity with the association set
            const newEmployee = {
                firstName: randomString(),
                lastName: randomString(),
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
                firstName: uniqueValue,
                lastName: randomString(),
                orgUnitId: null,
            };
            const createdEmployee = await service.create(newEmployee);
            // Search for the entity using the unique attribute
            const filter = {
                firstName: {
                    equals: uniqueValue,
                },
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
                firstName: uniqueValue,
                lastName: randomString(),
                orgUnitId: null,
            };
            await service.create(newEmployee);
            // Count entities matching the filter
            const filter = {
                firstName: {
                    equals: uniqueValue,
                },
            };
            const count = await service.countFor(filter);
            expect(count).to.be.a("number");
            expect(count).to.be.greaterThanOrEqual(1);
        });
    });
});
