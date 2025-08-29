import * as vscode from 'vscode';
import { GitProvider } from './services/GitProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('GitHub Desktop extension is now active!');

    const disposable = vscode.commands.registerCommand('gh-desk.showGitView', () => {
        const panel = vscode.window.createWebviewPanel(
            'gitView',
            'GitHub Desktop',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'dist')
                ]
            }
        );

        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
        
        // Initialize Git provider
        const gitProvider = new GitProvider(panel);
        
        // Clean up when panel is closed
        panel.onDidDispose(() => {
            gitProvider.dispose();
        });
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js'));
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'dist', 'webview.css'));

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GitHub Desktop</title>
            <script type="module" crossorigin src="${jsUri}"></script>
            <link rel="stylesheet" crossorigin href="${cssUri}">
        </head>
        <body>
            <div id="root"></div>
        </body>
        </html>
    `;
}

export function deactivate() {}