const {app, ipcMain, BrowserWindow, Menu} = require('electron');
var getAppDataPath = require('appdata-path').getAppDataPath();
const fs = require('fs');
const storage = require('electron-json-storage');

var preloaderWindow;
var indexWindow;
var registration;


function createWindow () {

    Menu.setApplicationMenu(null);

    preloaderWindow = new BrowserWindow({
        icon: __dirname + './assets/img/YPx1-WuF0Zk.jpg',
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
        maximizable: false,
        frame: false,
        resizable: false,
    });
    preloaderWindow.loadFile('preloader.html');
    preloaderWindow.once('ready-to-show', () => {
        preloaderWindow.show();

        storage.get('user', function(err, data) {
            if(data.length == undefined) {
                registration = new BrowserWindow({
                    icon: __dirname + './assets/img/YPx1-WuF0Zk.jpg',
                    webPreferences: {
                        nodeIntegration: true
                    },
                    show: false,
                    maximizable: false,
                    frame: false,
                    resizable: false,
                    width: 350,
                    height: 500,
                });

                registration.loadFile('registration.html');

                registration.once('ready-to-show', () => {
                    preloaderWindow.close();
                    registration.show();
                })
            } else {
                preloaderWindow.close();
                openDefaultWindow();
            }
        }); 
        
        


    })
}

function openDefaultWindow() {
    indexWindow = new BrowserWindow({
        icon: __dirname + './assets/img/YPx1-WuF0Zk.jpg',
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
        frame: false,
        simpleFullscreen: true,
    });

    indexWindow.loadFile('index.html');
    
    indexWindow.once('ready-to-show', () => {
        indexWindow.maximize();
        indexWindow.show();
    });
}
  
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

ipcMain.on('close', (event, arg) => {
    app.quit()
})