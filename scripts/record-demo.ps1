$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.Rate=-2
$rootPath=Join-Path $PSScriptRoot '..\public\audio\precached'
$entries=Get-Content -Raw -LiteralPath (Join-Path $rootPath 'scripts.json') | ConvertFrom-Json
$manifest=@{}
foreach($entry in $entries){
 $destination=[IO.Path]::GetFullPath((Join-Path $rootPath ($entry.file+'.wav')))
 $speaker.SetOutputToWaveFile($destination)
 $speaker.Speak($entry.text)
 $speaker.SetOutputToNull()
 $manifest[$entry.key]=@{text=$entry.text;audio=('/audio/precached/'+$entry.file+'.wav');source='device';persona=$entry.persona}
}
$speaker.Dispose()
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $rootPath 'manifest.json') -Encoding utf8
Write-Output 'Recorded three device-voice rehearsal files.'
