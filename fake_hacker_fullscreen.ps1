Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$window = New-Object System.Windows.Window
$window.WindowStyle = 'None'
$window.ResizeMode = 'NoResize'
$window.WindowState = 'Maximized'
$window.Topmost = $true
$window.Background = [System.Windows.Media.Brushes]::Black
$window.Cursor = [System.Windows.Input.Cursors]::None
$window.Title = 'System Console'

$grid = New-Object System.Windows.Controls.Grid
$grid.Background = [System.Windows.Media.Brushes]::Black

$text = New-Object System.Windows.Controls.TextBlock
$text.Foreground = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(0, 255, 90))
$text.FontFamily = New-Object System.Windows.Media.FontFamily 'Consolas'
$text.FontSize = 20
$text.LineHeight = 24
$text.Margin = New-Object System.Windows.Thickness 34, 28, 34, 28
$text.TextWrapping = 'Wrap'
$text.Text = ''

$grid.Children.Add($text) | Out-Null
$window.Content = $grid

$script:ctrlDown = $false
$script:altDown = $false
$script:lineIndex = 0
$script:lines = New-Object System.Collections.Generic.List[string]
$script:rng = New-Object System.Random

$phrases = @(
    'INITIATING REMOTE SESSION',
    'BYPASSING AUTHORIZATION GATEWAY',
    'SCANNING LOCAL SUBNET',
    'MOUNTING ENCRYPTED VOLUME',
    'INJECTING MEMORY PATCH',
    'OVERRIDING KERNEL ROUTES',
    'EXFILTRATION SIMULATION ACTIVE',
    'TRACE ROUTE MASKED',
    'ACCESS TOKEN ACCEPTED',
    'COMPILING PAYLOAD FRAGMENTS',
    'DECRYPTING SECURE CHANNEL',
    'ROOT SHELL NEGOTIATED',
    'SYSTEM MAP GENERATED',
    'FIREWALL RULES REWRITTEN',
    'SESSION PERSISTENCE CHECK'
)

function New-FakeLine {
    $stamp = (Get-Date).ToString('HH:mm:ss.fff')
    $hex = -join ((1..8) | ForEach-Object { '{0:X}' -f $script:rng.Next(0, 16) })
    $pct = $script:rng.Next(3, 100)
    $phrase = $phrases[$script:rng.Next(0, $phrases.Count)]
    $status = @('OK', 'WARN', 'LOCKED', 'RETRY', 'DONE')[$script:rng.Next(0, 5)]
    return "[$stamp] [$hex] $phrase ... $pct% [$status]"
}

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromMilliseconds(45)
$timer.Add_Tick({
    $script:lineIndex++
    $script:lines.Add((New-FakeLine))

    if (($script:lineIndex % 7) -eq 0) {
        $script:lines.Add(('> ' + (-join ((1..64) | ForEach-Object { '{0:X}' -f $script:rng.Next(0, 16) }))))
    }

    while ($script:lines.Count -gt 38) {
        $script:lines.RemoveAt(0)
    }

    $text.Text = ($script:lines -join [Environment]::NewLine)
})

$checkExit = {
    if ($script:ctrlDown -and $script:altDown) {
        $timer.Stop()
        $window.Close()
    }
}

$window.Add_KeyDown({
    param($sender, $eventArgs)
    if ($eventArgs.Key -eq 'LeftCtrl' -or $eventArgs.Key -eq 'RightCtrl') {
        $script:ctrlDown = $true
    }
    if ($eventArgs.SystemKey -eq 'LeftAlt' -or $eventArgs.SystemKey -eq 'RightAlt' -or $eventArgs.Key -eq 'LeftAlt' -or $eventArgs.Key -eq 'RightAlt') {
        $script:altDown = $true
    }
    & $checkExit
})

$window.Add_KeyUp({
    param($sender, $eventArgs)
    if ($eventArgs.Key -eq 'LeftCtrl' -or $eventArgs.Key -eq 'RightCtrl') {
        $script:ctrlDown = $false
    }
    if ($eventArgs.SystemKey -eq 'LeftAlt' -or $eventArgs.SystemKey -eq 'RightAlt' -or $eventArgs.Key -eq 'LeftAlt' -or $eventArgs.Key -eq 'RightAlt') {
        $script:altDown = $false
    }
})

$window.Add_Loaded({
    $window.Focus() | Out-Null
    $timer.Start()
})

[void]$window.ShowDialog()
