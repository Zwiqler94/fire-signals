/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { resolve, dirname, relative, join } from 'path';
import resolveModule from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import glob from 'glob';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';

const { sync: globSync } = glob;
const rootPackage = JSON.parse(readFileSync('package.json', { encoding: 'utf-8'} ));
const { peerDependencies, dependencies } = rootPackage;
const packageJsonPaths = globSync('**/package.json', { ignore: ['node_modules/**', 'dist/**', 'test/**'] });
const packages = packageJsonPaths.reduce((acc, path) => {
  const pkg = JSON.parse(readFileSync(path, { encoding: 'utf-8'} ));
  const component = dirname(path);
  if (component === '.') {
    Object.keys(pkg.exports).forEach(exportName => {
      pkg.exports[exportName].import = pkg.exports[exportName].import.replace(/^\.\/dist\//, './');
      pkg.exports[exportName].require = pkg.exports[exportName].require.replace(/^\.\/dist\//, './');
    });
  }
  acc[component] = pkg;
  return acc;
}, {});

const plugins = [resolveModule(), commonjs()];

const packageEntryFields = {
  browser: 'index.esm.js',
  main: 'index.cjs.js',
  module: 'index.esm.js',
  typings: 'index.d.ts',
};

function expectedPackageEntryPath(component, filename) {
  return relative(component, join('dist', component, filename));
}

function assertPackageEntryPaths(component, pkg) {
  Object.entries(packageEntryFields).forEach(([field, filename]) => {
    const expected = expectedPackageEntryPath(component, filename);
    if (pkg[field] !== expected) {
      throw new Error(
          `${pkg.name || component} package.json ${field} must be ` +
          `${expected}; found ${pkg[field]}`,
      );
    }
  });
}

const external = [
  ...Object.keys({ ...peerDependencies, ...dependencies }),
  'firebase/ai',
  'firebase/analytics',
  'firebase/app',
  'firebase/app-check',
  'firebase/data-connect',
  'firebase/messaging',
  'firebase/firestore',
  'firebase/firestore/lite',
  'firebase/auth',
  'firebase/functions',
  'firebase/storage',
  'firebase/database',
  'firebase/remote-config',
  'firebase/performance',
  '@angular/core',
  '@firebase/ai',
  '@firebase/analytics',
  '@firebase/app',
  '@firebase/app-check',
  '@firebase/data-connect',
  '@firebase/messaging',
  '@firebase/firestore',
  '@firebase/firestore/lite',
  '@firebase/auth',
  '@firebase/functions',
  '@firebase/storage',
  '@firebase/database',
  '@firebase/remote-config',
  '@firebase/performance',
];

const globals = {
  '@angular/core': 'ng.core',
  tslib: 'tslib',
  ...Object.values(packages).reduce((acc, {name}) => (acc[name] = name.replace(/\//g, '.'), acc), {}),
  'firebase/ai': 'firebase.ai',
  'firebase/analytics': 'firebase.analytics',
  'firebase/app': 'firebase.app',
  'firebase/app-check': 'firebase.app-check',
  'firebase/data-connect': 'firebase.data-connect',
  'firebase/messaging': 'firebase.messaging',
  'firebase/firestore': 'firebase.firestore',
  'firebase/firestore/lite': 'firebase.firestore-lite',
  'firebase/auth': 'firebase.auth',
  'firebase/functions': 'firebase.functions',
  'firebase/storage': 'firebase.storage',
  'firebase/database': 'firebase.database',
  'firebase/remote-config': 'firebase.remote-config',
  'firebase/performance': 'firebase.performance',
  '@firebase/ai': 'firebase.ai',
  '@firebase/analytics': 'firebase.analytics',
  '@firebase/app': 'firebase.app',
  '@firebase/app-check': 'firebase.app-check',
  '@firebase/data-connect': 'firebase.data-connect',
  '@firebase/messaging': 'firebase.messaging',
  '@firebase/firestore': 'firebase.firestore',
  '@firebase/firestore/lite': 'firebase.firestore-lite',
  '@firebase/auth': 'firebase.auth',
  '@firebase/functions': 'firebase.functions',
  '@firebase/storage': 'firebase.storage',
  '@firebase/database': 'firebase.database',
  '@firebase/remote-config': 'firebase.remote-config',
  '@firebase/performance': 'firebase.performance',
};

function writePackageJson(outputFolder, baseContents) {
  return {
    name: 'write-package-json',
    generateBundle() {
      mkdirSync(outputFolder, { recursive: true });
      writeFileSync(
          join(outputFolder, 'package.json'),
          `${JSON.stringify(baseContents, null, 2)}\n`,
      );
    },
  };
}

export default Object.keys(packages)
  .map(component => {
    const baseContents = packages[component];
    assertPackageEntryPaths(component, baseContents);
    const { browser, main, module, typings } = baseContents;
    // rewrite the paths for dist folder
    const outputFolder = join('dist', component);
    baseContents.browser = relative(outputFolder, resolve(component, browser));
    baseContents.main = relative(outputFolder, resolve(component, main));
    baseContents.module = relative(outputFolder, resolve(component, module));
    baseContents.typings = relative(outputFolder, resolve(component, typings));
    if (component === '.') {
      baseContents.scripts = {};
      delete baseContents.files;
      baseContents.devDependencies = {};
      baseContents.private = false;
    }
    return [
      {
        input: `${component}/index.ts`,
        output: [
          {
            file: resolve(component, main),
            format: 'cjs',
            sourcemap: true
          },
          {
            file: resolve(component, module),
            format: 'es',
            sourcemap: true
          }
        ],
        plugins: [
          ...plugins,
          typescript({
            sourceMap: true,
            declaration: false,
            declarationMap: false,
          }),
          writePackageJson(outputFolder, baseContents),
        ],
        external
      },
    ];
  }).flat();
