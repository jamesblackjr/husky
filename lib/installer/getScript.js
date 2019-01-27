"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const slash = require("slash");
// Used to identify scripts created by Husky
exports.huskyIdentifier = '# husky';
// Experimental
const huskyrc = '~/.huskyrc';
// Render script
const render = ({ createdAt, currentDir, homepage, node, pkgDirectory, pkgHomepage, platform, runScriptPath, version }) => `#!/bin/sh
${exports.huskyIdentifier}

# Hook created by Husky
#   Version: ${version}
#   At: ${createdAt}
#   See: ${homepage}

# From
#   Directory: ${pkgDirectory}
#   Homepage: ${pkgHomepage}

scriptPath="${runScriptPath}.js"
hookName=\`basename "$0"\`
gitParams="$*"

debug() {
  [ "$\{HUSKY_DEBUG\}" = "true" ] && echo "husky:debug $1"
}

debug "$hookName hook started..."
${platform !== 'win32'
    ? `
if ! command -v node >/dev/null 2>&1; then
  echo "Info: Can't find node in PATH, trying to find a node binary on your system"
fi
`
    : ''}
if [ -f "$scriptPath" ]; then
  # if [ -t 1 ]; then
  #   exec < /dev/tty
  # fi
  if [ -f ${huskyrc} ]; then
    debug "source ${huskyrc}"
    source ${huskyrc}
  fi

  HUSKY_CURRENT_DIR=${currentDir} ${node} "$scriptPath" $hookName "$gitParams"
else
  echo "Can't find Husky, skipping $hookName hook"
  echo "You can reinstall it using 'npm install husky --save-dev' or delete this hook"
fi
`;
/**
 * @param rootDir - e.g. /home/typicode/project/
 * @param huskyDir - e.g. /home/typicode/project/node_modules/husky/
 * @param requireRunNodePath - path to run-node resolved by require e.g. /home/typicode/project/node_modules/.bin/run-node
 * @param platform - platform husky installer is running on (used to produce win32 specific script)
 */
function default_1(rootDir, huskyDir, requireRunNodePath, 
// Additional param used for testing only
platform = os.platform()) {
    const runNodePath = slash(path.relative(rootDir, requireRunNodePath));
    // On Windows do not rely on run-node
    const node = platform === 'win32' ? 'node' : runNodePath;
    // Env variable
    const pkgHomepage = process && process.env && process.env.npm_package_homepage;
    const pkgDirectory = process && process.env && process.env.PWD;
    const currentDir = process &&
        process.env &&
        process.env.HUSKY_CURRENT_DIR &&
        process.env.HUSKY_CURRENT_DIR.toLowerCase() === 'true'
        ? true
        : false;
    // Husky package.json
    const { homepage, version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
    // Path to run.js
    const runScriptPath = slash(path.join(path.relative(rootDir, huskyDir), 'run'));
    // created at
    const createdAt = new Date().toLocaleString();
    // Render script
    return render({
        createdAt,
        currentDir,
        homepage,
        node,
        pkgDirectory,
        pkgHomepage,
        platform,
        runScriptPath,
        version
    });
}
exports.default = default_1;
