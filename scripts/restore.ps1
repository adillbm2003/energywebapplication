param (
    [string]$BackupFile = ""
)

if (Test-Path "../.env") {
    Get-Content "../.env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $key, $val = $line.Split("=", 2)
            [System.Environment]::SetEnvironmentVariable($key.Trim(), $val.Trim())
        }
    }
}

$DbHost = [System.Environment]::GetEnvironmentVariable("PGHOST") -or "localhost"
$DbPort = [System.Environment]::GetEnvironmentVariable("PGPORT") -or "5432"
$DbUser = [System.Environment]::GetEnvironmentVariable("PGUSER") -or "postgres"
$DbName = [System.Environment]::GetEnvironmentVariable("PGDATABASE") -or "cms_energy_bm"
$DbPass = [System.Environment]::GetEnvironmentVariable("PGPASSWORD") -or "postgres"

if (-not $BackupFile) {
    Write-Error "Please specify a backup file. Example: .\restore.ps1 -BackupFile ..\backups\db\db_backup_2026xxxx.sql"
    exit 1
}

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

$env:PGPASSWORD = $DbPass

Write-Host "Warning: This restore operation will overwrite database contents."
Write-Host "Starting database restoration..."
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BackupFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "Restoration completed successfully!"
} else {
    Write-Error "Restoration failed."
}
