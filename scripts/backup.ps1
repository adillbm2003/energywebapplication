# Load environment variables from .env
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

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "../backups/db"
$MediaBackupDir = "../backups/media"

if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }
if (-not (Test-Path $MediaBackupDir)) { New-Item -ItemType Directory -Path $MediaBackupDir | Out-Null }

$BackupFile = "$BackupDir/db_backup_$timestamp.sql"
$env:PGPASSWORD = $DbPass

Write-Host "Starting PostgreSQL logical backup..."
pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BackupFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database backup completed successfully: $BackupFile"
} else {
    Write-Warning "Database backup failed. Make sure pg_dump is in your PATH."
}

Write-Host "Starting media attachments backup..."
if (Test-Path "../uploads") {
    Copy-Item -Path "../uploads/*" -Destination $MediaBackupDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Media files backed up successfully to $MediaBackupDir"
} else {
    Write-Host "No uploads directory found to back up."
}
