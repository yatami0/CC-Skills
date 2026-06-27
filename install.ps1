<#
.SYNOPSIS
  web-design-mock スキル インストーラ (Windows / PowerShell)

.DESCRIPTION
  このリポジトリを clone した後に実行すると、スキルを対象リポジトリ(または個人用)の
  .claude/skills/ にコピーして Claude Code から /web-design-mock で使えるようにする。
  既存ファイルは壊さない(同名スキルが既にあれば -Force 指定が無い限り中止)。

.EXAMPLE
  .\install.ps1                      # 既定: カレントディレクトリ(プロジェクトに同梱)
  .\install.ps1 -User                # 個人用 (~/.claude/skills/。全プロジェクトで使える)
  .\install.ps1 C:\path\to\repo      # 指定リポジトリの .claude/skills/ にコピー
  .\install.ps1 C:\path\to\repo -Force   # 既存を上書き
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0)] [string]$Target = (Get-Location).Path,
  [switch]$User,
  [switch]$Force
)
$ErrorActionPreference = "Stop"

$SkillName = "web-design-mock"
$Source = Join-Path $PSScriptRoot ".claude/skills/$SkillName"

if (-not (Test-Path $Source)) {
  Write-Error "スキル本体が見つからない: $Source `nこのスクリプトはリポジトリ直下から実行してください。"
  exit 1
}

if ($User) {
  $DestRoot = Join-Path $HOME ".claude/skills"
} else {
  if (-not (Test-Path $Target)) { Write-Error "対象ディレクトリが存在しない: $Target"; exit 1 }
  $DestRoot = Join-Path $Target ".claude/skills"
}
$Dest = Join-Path $DestRoot $SkillName

# 自分自身への上書きを防ぐ
$srcFull = (Resolve-Path $Source).Path
$dstFull = if (Test-Path $Dest) { (Resolve-Path $Dest).Path } else { "__none__" }
if ($srcFull -eq $dstFull) {
  Write-Host "ok: 既にこのリポジトリ内のスキルを指しています($Dest)。何もしません。"
  exit 0
}

if ((Test-Path $Dest) -and (-not $Force)) {
  Write-Error "既に存在します: $Dest `n上書きするなら -Force を付けてください(既存は置き換えられます)。"
  exit 1
}

New-Item -ItemType Directory -Force -Path $DestRoot | Out-Null
if (Test-Path $Dest) { Remove-Item -Recurse -Force $Dest }
Copy-Item -Recurse -Force $Source $Dest

Write-Host "✓ インストール完了: $Dest"
Write-Host ""
Write-Host "次の手順:"
if ($User) {
  Write-Host "  - 全プロジェクトで Claude Code を起動し /web-design-mock で利用可能。"
} else {
  Write-Host "  - 対象リポジトリで Claude Code を起動(ワークスペースの信頼を承認)。"
  Write-Host "  - /web-design-mock で起動。git に commit すればチームで共有できます。"
}
Write-Host '  - 検証スクリプトは Node が必要: node "${CLAUDE_SKILL_DIR}/scripts/validate.mjs" <html>'
