// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  envName: 'dev',
  apiPath: {
    API_AA_URL: 'http://localhost:8089',
    API_PATIENT_INFO_URL: 'http://localhost:8080',
    API_PATIENT_VISIT_URL: 'http://localhost:8080/patient-visit',
    API_CMS_MANAGEMENT_URL: 'http://localhost:8080',
    API_URL: 'http://localhost:8080',
    API_DOMAIN: 'http://localhost:8080',
    API_DOCUMENT_URL: 'http://localhost:8080/document-management',
    API_INVENTORY_SYSTEM_URL: 'http://localhost:8080',
    API_VITAL_URL: 'http://localhost:8080/vital',
    API_PAYMENT_URL: 'http://localhost:8080/charging',
    API_PACKAGE_ITEM_INFO_URL: 'http://localhost:8080/item',
    SHOW_COPY_PRESCRIPTION_AFTER: '26-07-2018T00:00:00'

    // API_URL: 'https://devserver.lippoinnolab.com',
    // API_DOMAIN: 'devserver.lippoinnolab.com',
    // API_AA_URL: 'https://devserver.lippoinnolab.com/aacore',
    // API_PATIENT_VISIT_URL: 'https://devserver.lippoinnolab.com/cms-dua/patient-visit',
    // API_DOCUMENT_URL: 'https://devserver.lippoinnolab.com/cms-dua/document-management',
    // API_INVENTORY_SYSTEM_URL: 'https://devserver.lippoinnolab.com/cms-dua',
    // API_PATIENT_INFO_URL: 'https://devserver.lippoinnolab.com/cms-dua',
    // API_VITAL_URL: 'https://devserver.lippoinnolab.com/cms-dua/vital',
    // API_PAYMENT_URL: 'https://devserver.lippoinnolab.com/cms-dua/charging',
    // API_CMS_MANAGEMENT_URL: 'https://devserver.lippoinnolab.com/cms-dua',
    // API_PACKAGE_ITEM_INFO_URL: 'https://devserver.lippoinnolab.com/cms-dua/item',
    // SHOW_COPY_PRESCRIPTION_AFTER: '26-07-2018T00:00:00'
  }
};
