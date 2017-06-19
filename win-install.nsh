
!macro customInstall
  ${If} ${RunningX64}
    StrCpy $R1 "SOFTWARE\Classes\Installer\Dependencies\{d992c12e-cab2-426f-bde3-fb8c53950b0d}"
    StrCpy $R2 "${PROJECT_DIR}\backend\VC_redist.x64.exe /passive"
  ${Else}
    StrCpy $R1 "SOFTWARE\Classes\Installer\Dependencies\{e2803110-78b3-4664-a479-3611a381656a}"
    StrCpy $R2 "${PROJECT_DIR}\backend\VC_redist.x32.exe /passive"
  ${EndIf}

  ReadRegDword $R3 HKLM $R1 "DisplayName"

  ${If} $R3 == ""
    ExecWait $R2 $R4
    ${If} $R4 > 0
      MessageBox MB_OK "Visual C++ Redistributable install failed. Maybe you have to install manually. (Return $R4)"
    ${Else}
    ${EndIf}
  ${Else}
  ${EndIf}
!macroend
