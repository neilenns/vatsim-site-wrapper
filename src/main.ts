import { app, BrowserWindow, session } from "electron";
import { StatefullBrowserWindow } from "stateful-electron-window";
import squirrelStartup from "electron-squirrel-startup";
import path from "path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

const windows = new Set();

const createWindow = (name: string, site: string, title: string) => {
  console.log(app.getPath("userData"));

  let window = new StatefullBrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    title: title,
    icon: __dirname + `/images/${name}_icon.ico`,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    configFileName: `window-${name}-state.json`,
    supportMaximize: true,
  });

  // This ensures the app has one icon for each window in the toolbar on Windows
  window.setAppDetails({
    appId: name,
  });

  // Handle closing windows
  window.on("closed", () => {
    windows.delete(window);
    window = null;
  });

  // Prevent the pages from changing the app window titles.
  window.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  // Prevent the page from stopping the app from closing
  window.webContents.on("will-prevent-unload", (event) => {
    event.preventDefault();
  });

  // Actually show the window.
  windows.add(window);
  window.show();
  window.loadURL(site);
  window.setTitle(title);
};

const createWindows = () => {
  createWindow("vStrips", "https://strips.virtualnas.net/login", "vStrips");
  createWindow("vTDLS", "https://tdls.virtualnas.net/login", "vTDLS");
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindows();

  // Block the trash sound and any variants like `trash-<id>.mp3`.
  // Use a domain-wide filter and inspect the URL with a regex so
  // we match both `/sounds/trash.mp3` and `/assets/trash-CHaoGnjv.mp3`.
  const filter = {
    urls: ["https://strips.virtualnas.net/*"],
  };

  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    (details, callback) => {
      try {
        const url = details.url || "";
        // Match paths that end with /trash.mp3 or /trash-<anything>.mp3
        if (/\/trash(?:-[^/]+)?\.mp3$/.test(url)) {
          callback({ cancel: true });
          return;
        }
      } catch {
        // In unexpected cases, fall through and don't cancel.
      }
      callback({ cancel: false });
    }
  );
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
