const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'SnapBurger-CMS-win32-ia32/'),
    authors: 'Hubert Formin',
    owners:'Silverslopecm',
    noMsi:true,
    loadingGif:path.join(rootPath, 'setup.gif'),
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'SnapBurger-CMS.exe',
    certificateFile:path.join(rootPath, 'snap_key.pfx'),
    certificatePassword:'snapburger17',
    setupExe: 'snapburger-setup.exe',
    setupIcon: path.join(rootPath, 'logo.ico')
  })
}