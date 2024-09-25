# ProJor TypeScript Node.JS Client Library Template

This is a [ProJor](https://projor.io) template, that generates a _TypeScript Node.JS Client Library_ for the input entities.

## Using

* You should first install [ProJor](https://projor.io) to get started with this template.
* TODO: Add app specific instructions here.
* After that, open up the [`.entities`](.entities) file and start defining the entities you want your app to support:

```
entity OrganizationUnit {
    col name: String
    // Employees in the org unit
    reverse join employees: List<Employee>(org_unit)
}

// An employee
entity Employee {
    col first_name: String
    col last_name: String
    // Org unit of employee
    join org_unit: OrganizationUnit
}
```

* Then, run the following command in the terminal:

```bash
projor generate
```

* Now you can build the library into CommonJS and TypeScript declaration files:

```bash
npm install
npm run build
```

* After that, you should start a new backend (generated for example from [template-spring-boot-crud](https://github.com/SIOCODE-Open/template-spring-boot-crud))

* Now you can run the tests of the library:

```bash
npm test
```

* Whenever you want to _modify how the code is generated_, you should edit the templates in [template](template/), and run `projor generate` again.

## Further customization

In the [`project.pglobal.yaml`](project.pglobal.yaml) file, you can further customize the generated code:

* `scope` - The generated client library is always named `@SCOPE/NAME`. This is set to `example` by default, so the library is named `@example/NAME`.
* `name` - The name of the generated client library. This is set to `backend-client-node` by default, so the library is named `@example/backend-client-node`.
* `apiName` - The name of the API, that was set in the backend template. API routes are built using format `/API_NAME/v1/ENTITY_NAME`.
* `version` - The version number, which will be included in the generated `package.json`.
* `description` - The description of the library, which will be included in the generated `package.json`, and the `README.md`.

## How it works

* This template uses the [`entities.plang.js`](language/entities.plang.js) script to define a _[domain specific language](https://docs.projor.io/overview/languages.html)_ for defining entities.
* We have defined the [Entity schema](schema/Entity.pschema.yaml), and the [`.entities`](.entities) file is parsed by the language into this schema. This creates a [data collection](https://docs.projor.io/overview/data-collections.html) of entities, with ID `entities`.
* We created a couple of [templates](template/) to generate the source code.

## License

The template is licensed under MIT.

[ProJor](https://projor.io) is licensed under either the [ProJor Free License](https://license.projor.io) or the [ProJor Commercial License](https://license.projor.io).
