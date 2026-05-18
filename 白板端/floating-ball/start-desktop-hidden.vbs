Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = projectDir
logPath = projectDir & "\desktop-start.log"
shell.Run "cmd /c npm run desktop >> """ & logPath & """ 2>>&1", 0, False
