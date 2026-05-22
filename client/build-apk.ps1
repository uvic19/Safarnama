$ErrorActionPreference = "Stop"

$keystorePath = "safarnama-keystore.jks"
$keystorePass = "krish190706"
$keyAlias = "safarnama"
$keyPass = "krish190706"

# Bubblewrap downloads JDK here on Windows
$bubblewrapJdkPath = "$env:USERPROFILE\.bubblewrap\jdk\jdk-17.0.11+9\bin\keytool.exe"
$keytoolCmd = "keytool"

if (Test-Path $bubblewrapJdkPath) {
    $keytoolCmd = $bubblewrapJdkPath
}

if (-not (Test-Path $keystorePath)) {
    Write-Host "Generating keystore using keytool..."
    & $keytoolCmd -genkeypair -v -keystore $keystorePath -alias $keyAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $keystorePass -keypass $keyPass -dname "CN=Safarnama, OU=KridleApps, O=KridleApps, L=City, ST=State, C=IN"
    Write-Host "Keystore generated successfully at $keystorePath"
} else {
    Write-Host "Keystore already exists at $keystorePath"
}

Write-Host "--------------------------------------------------------"
Write-Host "Building APK with bubblewrap..."
# Note: bubblewrap might prompt for passwords interactively if not provided via CLI.
npx @bubblewrap/cli build

if (Test-Path "app-release-signed.apk") {
    $targetDir = "public\downloads"
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir | Out-Null
    }
    Move-Item -Path "app-release-signed.apk" -Destination "$targetDir\safarnama-v1.0.apk" -Force
    Write-Host "APK successfully generated and moved to $targetDir\safarnama-v1.0.apk"
} else {
    Write-Host "APK generation failed or file app-release-signed.apk not found."
}
