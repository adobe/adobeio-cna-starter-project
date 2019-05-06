# Runtime CNA Starter

A starter project for building a cloud native app (CNA) on top of Adobe I/O Runtime.

## Setup

- Install the AIO CLI and runtime plugin

  ```bash
  npm install -g @adobe/aio-cli
  aio plugins install @adobe/aio-cli-plugin-runtime
  ```

- `npm install`

- Create a `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `npm run dev` to start your local Dev server
- App will run on `localhost:9080` by default
- Local dev server uses an expressJS proxy to invoke action code.
- You can invoke your back-end actions defined locally via the url `localhost:9080/actions/<action_name>`

## Test & Coverage

- Run `npm run test` to run unit tests for ui and actions
- Run `npm run e2e` to run e2e tests
- Run `npm run coverage` to generate Code coverage report

## Build, Deploy & Cleanup

- `npm run build` to build your ui:React code and build your actions
- `npm run deploy` to deploy all actions on Runtime and static files to S3
- `npm run undeploy` to undeploy the app

For each of the above command you can either append `:ui` or `:actions`, for
example `npm run build:ui` will only build the UI.

## Dependencies

- aio runtime CLI for action deployments
- expressJS for local dev
- parcelJS for packaging UI App (React by default) and actions
- s3 for serving static files

## Config

### `.env`

```bash
WHISK_APIVERSION=v1
WHISK_APIHOST=https://adobeioruntime.net
WHISK_AUTH=<AUTH>
WHISK_NAMESPACE=<namespace>
# either TVM URL
TVM_URL=https://adobeioruntime.net/api/v1/web/adobeio/tvm/get-s3-upload-token
# Or bring your own S3 credentials and bucket
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret>
S3_BUCKET=<bucket>
```

### S3 Credentials

- Set the `TVM_URL` variable in `.env` to point to a deployed [CNA token vending
  machine](https://github.com/adobe/adobeio-cna-token-vending-machine). It
  allows you to download temporary and restricted credentials to upload your
  static files to S3. Credentials will be cached in `.aws.tmp.creds.json`. Users
  with a valid namespace for Adobe I/O Runtime can simply use
  `https://adobeioruntime.net/api/v1/web/adobeio/tvm/get-s3-upload-token`.

- Alternatively, you can bring your own AWS credentials by defining
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET` vars in your `.env`
  file. In that case make sure to create the bucket beforehand.

### `package.json`

- We use the `name` and `version` fields for the deployment. Make sure to fill
those out.

### `manifest.yml`

- List your backend actions under the `actions` field within the `__CNA_PACKAGE__`
package placeholder. We will take care of replacing the package name placeholder
by your project name and version.
- For each action, use the `function` field to indicate the path to the action
code.
- More documentation for supported action fields can be found
[here](https://github.com/apache/incubator-openwhisk-wskdeploy/blob/master/specification/html/spec_actions.md#actions).

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
   `package.json` and install them using `npm install`. Then set the `function`
   field in `manifest.yml` to point to the **entry file** of your action
   folder. We will use `parcelJS` to package your code and dependencies into a
   single minified js file. The action will then be deployed as a single file.
   Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
     `package.json` with the action's dependencies. Then set the `function`
     field in `manifest.yml` to point to the **folder** of that action. We will
     install the required dependencies within that directory and zip the folder
     before deploying it as a zipped action. Use this method if you want to keep
     your action's dependencies separated.

### `REMOTE_ACTIONS`

- This variable controls the configuration generation for action URLs used by the
  UI.

- `REMOTE_ACTIONS=true npm run dev` to run the UI locally but access
  remotely deployed actions.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
