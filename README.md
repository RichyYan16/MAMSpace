# Niranjan Nair - ICSP

Run `npm run dev` to run the site on localhost. To enter admin mode, log in with the email `nnair@wpi.edu` and the password `admin-password`.

## Secret Keys

Currently, Firebase API keys are exposed in the code, for ease of use and ease of setup. Because of this, I have not put this project up on Github. Furthermore, the Firestore database is currently in test mode for ease of testing, so there is open access. It can easily be changed to only allow authenticated users to make changes. To secure private keys, I have made a file `.env.local`, which is ignored by git and is standard for NextJS. Simply add the secrets as environment variables and replace their places in the code with `process.env.API_KEY_NAME` (with `API_KEY_NAME` being the name for the API key's environment variable).

## Authentication

At this time, the admin user is simply under my email for testing. This can easily be changed in the Firebase console's auth page. A more complex authentication scheme for non-admin users can be added, but for the MVP version of the site, only the admins can add/delete/edit users. Authentication is secured with a React Context so as to avoid middleware-related exploits that NextJS has faced in the past.

## Dependencies

This site uses the latest stable release of NextJS (which has patched the middleware exploit, but I am not using middleware for auth just to be safe). It also uses the latest versions of Firebase and ShadCN UI. Tailwind 3 is used instead of the newer Tailwind 4 for stability. Currently, I have imported all ShadCN UI components for speed, but many can slowly be removed since many are not used in the frontend code. Furthermore, some packages that are used by these additional components may be removed through `npm prune`. By latest versions, I mean latest at the time of writing: 4/25/25.
