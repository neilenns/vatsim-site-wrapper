import { app, BrowserWindow, screen } from "electron";
import WinState from "electron-win-state";
import Store from "electron-store";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const windows = new Set();

const createWindow = (
  name: string,
  site: string,
  title: string,
  xOffset: number,
  yOffset: number
) => {
  // Each window saves its settings in a separate store so window position is
  // maintained independently.
  const store = new Store({
    name: `window-${name}-config`,
  });

  // Test for the presence of a stored window x position as a sign that
  // this is the first launch of the app. Used later to set the default
  // x,y position of the window on first launch.
  const isFirstLaunch = !store.has("x");

  let window = WinState.createBrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    title: title,
    icon: __dirname + `/images/${name}_icon.ico`,
    winState: {
      store: store,
    },
    // The window is hidden by default so it can be set full screen if necessary before displaying.
    show: false,
  });

  // On first launch calculate the default position for the window, attempting to center it
  // on the primary display offset by the specified offset.
  if (isFirstLaunch) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const x = Math.floor((width - 800) / 2) + xOffset;
    const y = Math.floor((height - 600) / 2) + yOffset;

    // For some reason just using the win object had cases where the window size wouldn't change for
    // the non-active window. ChatGPT suggested this fix and it seems to work, although I have no idea
    // why it would be any different than just using the win object.
    const targetWindow = BrowserWindow.fromId(window.id);
    targetWindow.setPosition(x, y);
  }

  // The electron-win-state package doesn't remember full screen state
  // so take care of that by reading a saved value from the store.
  window.setFullScreen(Boolean(store.get("fullScreen")));

  // This ensures the app has one icon for each window in the toolbar on Windows
  window.setAppDetails({
    appId: name,
  });

  // When the app goes into and out of full screen remember the state
  // so it can be restored on future runs.
  window.on("enter-full-screen", () => {
    store.set("fullScreen", true);
  });
  window.on("leave-full-screen", () => {
    store.set("fullScreen", false);
  });

  // Handle closing windows
  window.on("closed", () => {
    windows.delete(window);
    window = null;
  });

  // Actually show the window.
  windows.add(window);
  window.show();
  window.loadURL(site);
};

const createWindows = () => {
  createWindow(
    "vStrips",
    "https://strips.virtualnas.net/login",
    "vStrips",
    0,
    0
  );
  createWindow("vTDLS", "https://tdls.virtualnas.net/login", "vTDLS", 20, 20);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindows);

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
