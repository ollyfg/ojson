import * as vscode from "vscode";
import * as stringify from "json-stable-stringify";

// Called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("ojson is active");

  // Commands has been defined in the package.json file
  const toJsonCommand = vscode.commands.registerCommand("ojson.to_json", () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;
    if (selection?.isEmpty) {
      console.log("Skipping because selection is empty");
      return;
    }
    let text = editor?.document.getText(selection);
    let input: any;
    let output: string;
    if (!text) {
      console.log("Skipping because input is undefined", {
        selection,
        text,
      });
      return;
    }
    try {
      // Replace all `key:`s with `"key":`
      const keys = text.match(/\b.*?:/g);
      if (keys) {
        for (const key of keys) {
          // Get rid of any other quotes
          const cleanKey = key.replace(/['"`:]/g, "");
          text = text.replace(key, `"${cleanKey}":`);
        }
      }
      input = JSON.parse(text);
    } catch (error) {
      console.error("ojson.to_json.error", error);
      vscode.window.showErrorMessage(`Could not parse JSON: ${error}`);
      return;
    }
    if (selection) {
      output = stringify(input, { space: 2 });
      editor?.edit((editBuilder) => {
        editBuilder.replace(selection, output);
      });
    } else {
      console.log("Skipping because selection is undefined", {
        selection,
      });
    }
  });
  const toLitCommand = vscode.commands.registerCommand("ojson.to_lit", () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;
    if (selection?.isEmpty) {
      console.log("Skipping because selection is empty");
      return;
    }
    const text = editor?.document.getText(selection);
    if (!text) {
      console.log("Skipping because there is no text in the selection");
      return;
    }
    // Make sure it's JSON
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("ojson.to_lit.error", error);
      vscode.window.showErrorMessage(`Could not parse JSON: ${error}`);
      return;
    }

    if (selection && parsed) {
      let literal = stringify(parsed, { space: 2 });

      const keys = literal.match(/".*?":/g);

      if (keys) {
        for (const key of keys) {
          literal = literal.replace(key, key.replace(/"/g, ""));
        }
      }
      editor?.edit((editBuilder) => {
        editBuilder.replace(selection, literal);
      });
    }
  });

  context.subscriptions.push(toJsonCommand);
  context.subscriptions.push(toLitCommand);
}

// Called when your extension is deactivated
export function deactivate() {}
