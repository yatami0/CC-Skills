<#
.SYNOPSIS
  web-design スキル インストーラ (Windows / PowerShell)

.DESCRIPTION
  このリポジトリを clone した後に実行すると、スキル一式を対象リポジトリ(または個人用)の
  .claude/skills/ にコピーして Claude Code から使えるようにする。
  インストールされるスキル(対になっているので両方入れる):
    - web-design-mock     哲学 → モック(生成)
    - web-design-distill  モック → 哲学(蒸留 / 逆向き。mock の validate.mjs と references を共有)
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

$SkillNames = @("web-design-mock", "web-design-distill")

# ソースが全て揃っているか先に確認 ───────────────────────────────────────────
foreach ($name in $SkillNames) {
  $src = Join-Path $PSScriptRoot ".claude/skills/$name"
  if (-not (Test-Path $src)) {
    Write-Error "スキル本体が見つからない: $src `nこのスクリプトはリポジトリ直下から実行してください。"
    exit 1
  }
}

if ($User) {
  $DestRoot = Join-Path $HOME ".claude/skills"
} else {
  if (-not (Test-Path $Target)) { Write-Error "対象ディレクトリが存在しない: $Target"; exit 1 }
  $DestRoot = Join-Path $Target ".claude/skills"
}

# 競合チェック(コピー前に全スキルを検査して、衝突があれば何もせず中止)─────────
$Skip = @()
foreach ($name in $SkillNames) {
  $src = Join-Path $PSScriptRoot ".claude/skills/$name"
  $dest = Join-Path $DestRoot $name
  $srcFull = (Resolve-Path $src).Path
  $dstFull = if (Test-Path $dest) { (Resolve-Path $dest).Path } else { "__none__" }
  if ($srcFull -eq $dstFull) { $Skip += $name; continue }
  if ((Test-Path $dest) -and (-not $Force)) {
    Write-Error "既に存在します: $dest `n上書きするなら -Force を付けてください(既存は置き換えられます)。"
    exit 1
  }
}

New-Item -ItemType Directory -Force -Path $DestRoot | Out-Null
foreach ($name in $SkillNames) {
  $src = Join-Path $PSScriptRoot ".claude/skills/$name"
  $dest = Join-Path $DestRoot $name
  if ($Skip -contains $name) {
    Write-Host "ok: 既にこのリポジトリ内のスキルを指しています($dest)。スキップ。"
    continue
  }
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  Copy-Item -Recurse -Force $src $dest
  Write-Host "✓ インストール完了: $dest"
}

Write-Host ""
Write-Host "次の手順:"
if ($User) {
  Write-Host "  - 全プロジェクトで Claude Code を起動し /web-design-mock(生成)/ /web-design-distill(蒸留)で利用可能。"
} else {
  Write-Host "  - 対象リポジトリで Claude Code を起動(ワークスペースの信頼を承認)。"
  Write-Host "  - /web-design-mock(生成)/ /web-design-distill(蒸留)で起動。git に commit すればチームで共有できます。"
}
Write-Host '  - 検証スクリプトは Node が必要: node "${CLAUDE_SKILL_DIR}/scripts/validate.mjs" <html>'
