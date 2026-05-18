param(
    [string]$SourcePng = 'd:\project\bubustep_proto\S01.png',
    [string]$OutDir = 'd:\project\bubustep_proto_out'
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
}

$logPath = Join-Path $OutDir '_crop_log.txt'
$img = [System.Drawing.Image]::FromFile($SourcePng)
$W0 = $img.Width
$H0 = $img.Height
"Source $SourcePng" | Out-File -FilePath $logPath -Encoding utf8
"Dims $W0 x $H0" | Out-File -FilePath $logPath -Append -Encoding utf8

function Save-CropFrac($x0, $y0, $x1, $y1, $Name) {
    $px = [int]($x0 * $W0)
    $py = [int]($y0 * $H0)
    $pw = [int](($x1 - $x0) * $W0)
    $ph = [int](($y1 - $y0) * $H0)
    $bmp = New-Object System.Drawing.Bitmap $pw, $ph
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $srcRect = New-Object System.Drawing.Rectangle $px, $py, $pw, $ph
    $dstRect = New-Object System.Drawing.Rectangle 0, 0, $pw, $ph
    $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $outPath = Join-Path $OutDir ($Name + '.png')
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $msg = 'Saved ' + $Name + ' size ' + $pw + 'x' + $ph + ' at ' + $px + ',' + $py
    $msg | Out-File -FilePath $logPath -Append -Encoding utf8
}

Save-CropFrac 0.0480 0.0820 0.1430 0.2050 'avatar_zhang'
Save-CropFrac 0.7035 0.2580 0.9620 0.5210 'illu_pre_class_materials'

# Icons: pitch is 0.186, first center at 0.116
Save-CropFrac 0.0660 0.687 0.1660 0.775 'icon_textbook'
Save-CropFrac 0.2520 0.687 0.3520 0.775 'icon_notebook'
Save-CropFrac 0.4380 0.687 0.5380 0.775 'icon_homework'
Save-CropFrac 0.6240 0.687 0.7240 0.775 'icon_errorbook'
Save-CropFrac 0.8100 0.687 0.9100 0.775 'icon_courseware'

$img.Dispose()
'Done.' | Out-File -FilePath $logPath -Append -Encoding utf8
Get-Content $logPath
