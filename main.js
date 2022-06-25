const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1240,
    height: 1000,
    minWidth: 1240,
    minHeight: 960,
    backgroundColor: '#fff',
    show: true,
    icon: path.join(__dirname, 'assets/icons/win/icon.ico'),
    webPreferences: { nodeIntegration: true }
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'www/default.htm'),
    protocol: 'file',
    slashes: true
  }));
  //const mainMenu = Menu.buildFromTemplate(templateMenu);
  //Menu.setApplicationMenu(mainMenu);
  win.setMenu(null);
  win.on('closed', () => {
    win = null
  });
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  });
};
// F U N C I O N E S
require('./www/mongoose.conexion')
const usuarios = require("./www/mongoose.usuarios");


//info cliente
const os = require("os")

ipcMain.on('infoCliente', e => {
  e.reply('infoCliente', {
    tipo: os.type(),
    plataforma: os.platform(),
    arquitectura: os.arch(),
    nombreHost: os.hostname(),
    memoriaRAM: os.totalmem(),
    CPU: os.cpus()[0].model,
  })
})


ipcMain.on('comprueba', async (e, ob) => {
  console.log('73 IDENT-ids:', ob)
  const Usuarios = await usuarios.find(ob);
  console.log('75 Usuarios:', Usuarios)
  e.reply("comprueba", Usuarios);
})


ipcMain.on('activa', async (e, ob) => {
  let filtro = { e_mail: ob.e_mail, clave: ob.clave, app_id: ob.app_id }
  console.log('82 filtro:',filtro)
  delete ob.e_mail, ob.clave, ob.app_id
  console.log('84 IDENT - {e_mail,clave,app_id}:',ob)
  // const DatosNuevos = await usuarios.findOneAndUpdate(id, ob, { new: true, upsert: true });
  const DatosNuevos = await usuarios.findOneAndUpdate(filtro, ob, { new: true });
  console.log('87 DatosNuevos:',DatosNuevos)
  e.reply("activa", JSON.stringify(DatosNuevos));
})
ipcMain.on('herramientas',()=>{ win.webContents.openDevTools();})