# start-dev.ps1
# 1) Start MySQL (only if not already running)
if (-not (Get-NetTCPConnection -LocalPort 3306 -State Listen -EA SilentlyContinue)) {
    Start-Process "C:\xampp\mysql\bin\mysqld.exe" "--defaults-file=C:\xampp\mysql\bin\my.ini"
    Start-Sleep 4
    Write-Host "MySQL started"
} else {
    Write-Host "MySQL already running"
}

# 2) Start PHP backend (only if not already running)
if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -EA SilentlyContinue)) {
    Start-Process "C:\xampp\php\php.exe" "-S" "127.0.0.1:8000" `
        -WorkingDirectory "D:\ICT Chamber\kainafresh-platform\backend"
    Start-Sleep 2
    Write-Host "PHP backend started on http://127.0.0.1:8000"
} else {
    Write-Host "PHP backend already running"
}