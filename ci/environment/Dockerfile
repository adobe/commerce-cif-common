################################################################################
#
#    Copyright 2018 Adobe. All rights reserved.
#    This file is licensed to you under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License. You may obtain a copy
#    of the License at http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software distributed under
#    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
#    OF ANY KIND, either express or implied. See the License for the specific language
#    governing permissions and limitations under the License.
#
################################################################################

FROM circleci/openjdk:8-jdk-node

LABEL maintainer="Adobe"

ENV SONAR_SCANNER_VERSION=3.2.0.1227-linux

WORKDIR /home/circleci

# Install wsk
RUN mkdir bin && \
    cd bin && \
    wget -nv https://openwhisk.ng.bluemix.net/cli/go/download/linux/amd64/OpenWhisk_CLI-linux.tgz && \
    tar -xvzf OpenWhisk_CLI-linux.tgz && \
    rm OpenWhisk_CLI-linux.tgz && \
    chmod +x wsk

# Install sonar scanner
RUN cd bin && \
    wget -nv https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}.zip && \
    unzip -q sonar-scanner-cli-${SONAR_SCANNER_VERSION}.zip && \
    rm sonar-scanner-cli-${SONAR_SCANNER_VERSION}.zip && \
    mv sonar-scanner-${SONAR_SCANNER_VERSION} sonar-scanner && \
    chmod +x sonar-scanner/bin/sonar-scanner

ENV PATH="${PATH}:/home/circleci/bin:/home/circleci/bin/sonar-scanner/bin"