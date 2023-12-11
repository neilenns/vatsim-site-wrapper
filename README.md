# VATSIM vNAS sites

This project provides a standalone application that wraps the
[vStrips](https://strips.virtualnas.net/login) and
[vTDLS](https://tdls.virtualnas.net/login) websites.

Features:

* Each site shows in its own window with an appropriate icon
on the taskbar.
* Window position is remembered across app launches.
* F11 maximizes the window.

## Why?

Because the two sites don't provide a PWA manifest, meaning
there's no way to get them to be in a browser window without
any browser chrome when you want to share them in a live stream.
If the two sites provided a PWA manifest this entire app wouldn't
be needed.
