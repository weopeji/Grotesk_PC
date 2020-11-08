const {app, ipcMain, BrowserWindow, Menu} = require('electron');
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
            if(!data.token) {
                openRegistrationWindow();
                preloaderWindow.close();
            } else {
                openDefaultWindow();
                preloaderWindow.close();
            }
        }); 
    })
}

function openRegistrationWindow() {
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
    registration.loadFile('./registration.html');
    registration.once('ready-to-show', () => {
        registration.show();
    });
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

    indexWindow.webContents.openDevTools()
}
  
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('close', (event, arg) => {
    app.quit()
});

ipcMain.on('delet_user', (event, arg) => {
    storage.clear();
    openRegistrationWindow();
    indexWindow.close();
});

ipcMain.on('add_user', (event, arg) => {
    storage.set('user', { token: arg }, function(error) {
        if (error) throw error;
    });
});

ipcMain.on('auth_go', (event, arg) => {
    openDefaultWindow();
    registration.close();
});

ipcMain.on('get_user', (event, arg) => {
    storage.get('user', function(err, data) {
        event.returnValue = data.token;
    });
});