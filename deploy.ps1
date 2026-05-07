param(
  [ValidateSet("all", "up", "down", "status", "logs", "build", "push", "publish")]
  [string]$Action = "all",
  [int]$HostPort = 8080,
  [string]$Image = "192.168.2.141:5000/esp32cam-rtsp-viewer:latest",
  [ValidateSet("remote", "local")]
  [string]$Target = "remote",
  [string]$RemoteHost = "j@192.168.2.141",
  [string]$ContainerName = "esp32cam-rtsp-viewer"
)

$ErrorActionPreference = "Stop"

function Assert-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "'$Name' was not found."
  }
}

function Invoke-Cmd {
  param([string]$File, [string[]]$CmdArgs)
  & $File @CmdArgs

  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $File $($CmdArgs -join ' ')"
  }
}

function Invoke-Ssh {
  param([string]$RemoteCommand)

  $sshArgs = @(
    "-F", "NUL",
    "-o", "BatchMode=no",
    "-o", "PreferredAuthentications=password,keyboard-interactive",
    "-o", "PasswordAuthentication=yes",
    "-o", "KbdInteractiveAuthentication=yes",
    "-o", "HostbasedAuthentication=no",
    "-o", "PubkeyAuthentication=no",
    "-o", "IdentityAgent=none",
    "-o", "IdentityFile=none",
    "-o", "CertificateFile=none",
    "-o", "IdentitiesOnly=yes",
    "-o", "UpdateHostKeys=no",
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "GlobalKnownHostsFile=/dev/null",
    $RemoteHost,
    $RemoteCommand
  )

  Invoke-Cmd -File "ssh" -CmdArgs $sshArgs
}

function Invoke-RemoteDeploy {
  $remoteScript = @(
    "set -e",
    "docker pull $Image",
    "docker rm -f $ContainerName >/dev/null 2>&1 || true",
    "docker run -d --name $ContainerName --restart unless-stopped -p ${HostPort}:3000 $Image",
    "docker ps --filter name=$ContainerName"
  ) -join "; "

  Invoke-Ssh -RemoteCommand $remoteScript
}

function Invoke-RemoteDown {
  Invoke-Ssh -RemoteCommand "docker rm -f $ContainerName >/dev/null 2>&1 || true"
}

function Invoke-RemoteStatus {
  Invoke-Ssh -RemoteCommand "docker ps --filter name=$ContainerName"
}

function Invoke-RemoteLogs {
  Invoke-Ssh -RemoteCommand "docker logs --tail 150 -f $ContainerName"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Assert-Command -Name "docker"

if ($Target -eq "remote") {
  Assert-Command -Name "ssh"
}

switch ($Action) {
  "all" {
    Invoke-Cmd -File "docker" -CmdArgs @("build", "-t", $Image, ".")
    Invoke-Cmd -File "docker" -CmdArgs @("push", $Image)

    if ($Target -eq "remote") {
      Invoke-RemoteDeploy
    }
    else {
      $env:HOST_PORT = $HostPort
      Invoke-Cmd -File "docker" -CmdArgs @("compose", "up", "-d", "--build")
      Invoke-Cmd -File "docker" -CmdArgs @("compose", "ps")
    }
    Write-Host "Deployment complete. Image: $Image"
    break
  }
  "up" {
    if ($Target -eq "remote") {
      Invoke-RemoteDeploy
    }
    else {
      $env:HOST_PORT = $HostPort
      Invoke-Cmd -File "docker" -CmdArgs @("compose", "up", "-d", "--build")
    }
    break
  }
  "down" {
    if ($Target -eq "remote") {
      Invoke-RemoteDown
    }
    else {
      Invoke-Cmd -File "docker" -CmdArgs @("compose", "down")
    }
    break
  }
  "status" {
    if ($Target -eq "remote") {
      Invoke-RemoteStatus
    }
    else {
      Invoke-Cmd -File "docker" -CmdArgs @("compose", "ps")
    }
    break
  }
  "logs" {
    if ($Target -eq "remote") {
      Invoke-RemoteLogs
    }
    else {
      Invoke-Cmd -File "docker" -CmdArgs @("compose", "logs", "-f", "--tail", "150")
    }
    break
  }
  "build" {
    Invoke-Cmd -File "docker" -CmdArgs @("build", "-t", $Image, ".")
    Write-Host "Image built: $Image"
    break
  }
  "push" {
    Invoke-Cmd -File "docker" -CmdArgs @("push", $Image)
    Write-Host "Image pushed: $Image"
    break
  }
  "publish" {
    Invoke-Cmd -File "docker" -CmdArgs @("build", "-t", $Image, ".")
    Invoke-Cmd -File "docker" -CmdArgs @("push", $Image)
    Write-Host "Build + push complete: $Image"
    break
  }
}
