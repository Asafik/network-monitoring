$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Select-Object -First 1
if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=NetSpeedXDev" -CertStoreLocation Cert:\CurrentUser\My
}

Get-ChildItem -Path "F:\network-monitor\src-tauri\target", "F:\network-monitor" -Include "*.exe","*.dll" -ErrorAction SilentlyContinue | ForEach-Object {
    Set-AuthenticodeSignature -FilePath $_.FullName -Certificate $cert -ErrorAction SilentlyContinue | Out-Null
    Unblock-File -Path $_.FullName -ErrorAction SilentlyContinue
}
