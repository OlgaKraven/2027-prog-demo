#!/usr/bin/env python3
"""Execute a PowerShell script through Parallels without shell interpolation."""
import base64,subprocess,sys
script='$ErrorActionPreference="Stop";$ProgressPreference="SilentlyContinue";'+sys.stdin.read()
result=subprocess.run(['prlctl','exec','Windows 11','powershell.exe','-NoProfile','-EncodedCommand',base64.b64encode(script.encode('utf-16le')).decode()],capture_output=True,text=True,errors='replace',timeout=180)
print(result.stdout)
if result.returncode:print(result.stderr,file=sys.stderr)
sys.exit(result.returncode)
