// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
const os = require('os');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "go-version-switcher" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('go-version-switcher.run', function () {
		   // Execute gvm list
		   exec('gvm list', (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage('Error listing Go versions');
                return;
            }

            let goVersions = parseGvmListOutput(stdout);
            vscode.window.showQuickPick(goVersions).then(selectedVersion => {
                if (selectedVersion) {
					vscode.window.showInformationMessage('Selected Version: ' + selectedVersion);
					updateGoSettings(selectedVersion);
                }
            });
        });
		// Display a message box to the user
	});

	context.subscriptions.push(disposable);
}



function updateGoSettings(version) {
	const homeDir = os.homedir();
    const gorootPath = `${homeDir}/.gvm/gos/${version}`;
    const gopathPath = `${homeDir}/.gvm/pkgsets/${version}/global`;

    let config = vscode.workspace.getConfiguration('go');
    config.update('goroot', gorootPath, vscode.ConfigurationTarget.Workspace);
    config.update('gopath', gopathPath, vscode.ConfigurationTarget.Workspace);
}

function parseGvmListOutput(output) {
    // Split the output into lines
    return output.split('\n')
                 .map(line => line.trim()) // Trim each line
                 .filter(line => line.match(/go\d+\.\d+/)) // Filter lines matching the pattern
                 .map(line => line.match(/go\d+\.\d+/)[0]); // Extract the version number
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
