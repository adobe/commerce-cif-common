/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const e = require('child_process');
const CI = require('./ci.js');
const ci = new CI();

ci.context();
let gitRemote = "";

if (!process.env.RELEASE_MODULES) {
    throw new Error("Missing RELEASE_MODULES environment variable");
}
const releasePackages = JSON.parse(process.env.RELEASE_MODULES);

ci.stage('RELEASE PROVISION');
// Setup git repository for push access
gitRemote = e.execSync("git config --get remote.origin.url").toString();
if (!gitRemote.startsWith("https://")) {
    throw new Error("Git checkout via HTTPS is required.");
}

// Add credentials to git remote
gitRemote = "https://" + process.env.GIT_USERNAME + ":" + process.env.GIT_PASSWORD + "@" + gitRemote.slice("https://".length);

// Provision
ci.sh('npm install');

ci.stage('PERFORM RELEASE');
ci.gitCredentials(gitRemote, () => {
    ci.gitImpersonate(process.env.RELEASE_USER, process.env.RELEASE_USER, () => {
        for (let pkg of Object.keys(releasePackages)) {
            // Skip packages that should not be released
            if (!['patch', 'minor', 'major'].includes(releasePackages[pkg])) {
                continue;
            }

            // Release
            ci.dir(pkg, () => {
                console.log('Perform release for module in ' + pkg + ' as ' + releasePackages[pkg] + ' update.');
                ci.sh('\$(npm bin)/release-it --increment ' + releasePackages[pkg] + ' --non-interactive --src.beforeStartCommand=\"\"');
            });
        }
    });
});