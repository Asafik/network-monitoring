$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Select-Object -First 1
if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=NetPulseDev" -CertStoreLocation Cert:\CurrentUser\My
}
if (Test-Path "F:\network-monitor\src-tauri\target\debug\network-monitor.exe") {
    Set-AuthenticodeSignature -FilePath "F:\network-monitor\src-tauri\target\debug\network-monitor.exe" -Certificate $cert
}
