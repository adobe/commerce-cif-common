[![CircleCI](https://circleci.com/gh/adobe/commerce-cif-common.svg?style=svg)](https://circleci.com/gh/adobe/commerce-cif-common)

# Commerce Integration Framework - common module for all implementations
CIF Common module implementation contains the common actions that will be used by customers 
to sequence their actions and common code useful for any implementation.   

Currently one action is implemented: `src/web-action-transformer`.
The common code consist from validators, exceptions, utils etc.: `src/shared`  

## Getting Started
To install all npm dependencies and bootstrap lerna, simply run:
```
npm install
```
**Note:** npm dependencies are managed with lerna [lerna](https://github.com/lerna/lerna).

## Testing
For testing, each package is configured to perform a static code analysis using *[ESLint](http://eslint.org/)* as well as executing
*[Mocha](https://mochajs.org/)* unit tests. For unit tests, *[chai.js](http://chaijs.com/)* is used for assertions and
*[sinon.js](http://sinonjs.org/)* can be used for mocking. We use *[istanbul.js](https://github.com/istanbuljs/nyc)* to collect testing code coverage.

To run linting, tests and coverage analysis, run `npm test` in the root folder.

## Deployment
Deployment instructions are available in the repository specific to each CIF integration.