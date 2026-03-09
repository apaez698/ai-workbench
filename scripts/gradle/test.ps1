param(
  [string]$ProjectPath = "."
)

Push-Location $ProjectPath
try {
  if (-Not (Test-Path "./gradlew.bat")) {
    throw "No se encontró gradlew.bat en $ProjectPath"
  }

  ./gradlew.bat test
}
finally {
  Pop-Location
}