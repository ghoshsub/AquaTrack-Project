try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/google" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"idToken": "dummy"}'
} catch {
    Write-Host "Error Status: " $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Response: " $reader.ReadToEnd()
}
