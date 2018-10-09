const {app, BrowserWindow, ipcMain,Notification, Tray, Menu} = require('electron')

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win

  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
      show:false,
      backgroundColor:'#2e2c29',
      width: 1000,
      title:'SnapBurger CMS',
      height: 700,
      minWidth:950,
      minHeight:600,
      icon: './src/img/logo-round.png',
      webPreferences: {
        nodeIntegrationInWorker: true
      }
    })

    // and load the index.html of the app.
    win.loadFile('src/index.html')

    // Open the DevTools.
    win.webContents.openDevTools()
    
    //when the widow is ready to display
    win.once('ready-to-show', () => {
      win.show()
    })

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  /*let tray = null
  app.on('ready', () => {
    tray = new Tray('./src/img/logo-round.png')
    const contextMenu = Menu.buildFromTemplate([
      {label: 'Item1', type: 'radio'},
      {label: 'Item2', type: 'radio'},
      {label: 'Item3', type: 'radio', checked: true},
      {label: 'Item4', type: 'radio'}
    ])
    tray.setToolTip('SnapBurger')
    tray.setContextMenu(contextMenu)
  })*/

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  //============= LISTENING TO RENDER PROCESS MESSAGES ! ===========
ipcMain.on('asynchronous-message', (event, msg) => {
    const arg = JSON.parse(msg)
    switch(arg.type){
      case "notification":
      if(Notification.isSupported()){
        var notify = new Notification({title:"Orders ending soon!",body:arg.msg})
        notify.show();
        //console.log("Notifyer shown!")
      }else{
        console.log("Not supported!")
      }
        
        break;
    }
  })