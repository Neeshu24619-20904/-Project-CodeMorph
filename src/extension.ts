import * as vscode from "vscode";
import { convertCodeWithAI } from "./convert";

export function activate(context: vscode.ExtensionContext) {

  vscode.workspace.onDidRenameFiles(async (event) => {

    const oldFile = event.files[0].oldUri.fsPath;
    const newFile = event.files[0].newUri.fsPath;

    const oldExt = oldFile.split('.').pop();
    const newExt = newFile.split('.').pop();

    if (oldExt !== newExt) {

      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const code = editor.document.getText();

      const confirm = await vscode.window.showInformationMessage(
        `Convert ${oldExt} → ${newExt}?`,
        "Yes", "No"
      );

      if (confirm === "Yes") {
        const newCode = await convertCodeWithAI(code, oldExt!, newExt!);

        const fullRange = new vscode.Range(
          editor.document.positionAt(0),
          editor.document.positionAt(code.length)
        );

        editor.edit(editBuilder => {
          editBuilder.replace(fullRange, newCode);
        });
      }

    }
  });
}
