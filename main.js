const {app, BrowserWindow, Menu} = require('electron');


var preloaderWindow;
var indexWindow;

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

        getAllData(function() {
            
            indexWindow = new BrowserWindow({
                icon: __dirname + './assets/img/YPx1-WuF0Zk.jpg',
                webPreferences: {
                    nodeIntegration: true
                },
                show: false,
                frame: true,
                simpleFullscreen: true,
            });

            indexWindow.loadFile('index.html');
            
            indexWindow.once('ready-to-show', () => {
                indexWindow.maximize();
                indexWindow.show();
                preloaderWindow.close();
            })

        });
    })
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


function getAllData(callback) {
    callback();
}