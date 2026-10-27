# Changelog

All notable changes to **SpawnDev.SpawnJS.TangoADB** are documented here.

## 1.0.1 - 2026-10-27

- **Depends on SpawnDev.SpawnJS 3.0.5** (was 3.0.0). 3.0.5 fixes `JSTape` allocating memory quadratic in the size of a
  call once its arguments outgrew one tape segment (64 KB); 3.0.4 reads records and constructor-only classes. No
  change of its own. The demo moves to SpawnDev.SpawnJS.Blazor 3.0.5. Tests: `SpawnDev.SpawnJS.TangoADB.Tests` pass.

## 1.0.0

First release: the [SpawnDev.SpawnJS](https://github.com/LostBeard/SpawnDev.SpawnJS) edition of
[SpawnDev.BlazorJS.TangoADB](https://github.com/LostBeard/SpawnDev.BlazorJS.TangoADB) 1.0.0 - the same wrapper around
[Tango](https://github.com/yume-chan/ya-webadb) (`@yume-chan/ya-webadb`), ADB over WebUSB, now on SpawnDev.SpawnJS.
The API matches BlazorJS.TangoADB 1.0.0 except where noted.

### Changed from BlazorJS.TangoADB 1.0.0

- Built on SpawnDev.SpawnJS 3.0.0 (namespace `SpawnDev.SpawnJS.TangoADB`); wrappers derive from `SpawnJSObject`.
- Target framework net10.0 (SpawnDev.SpawnJS 3 is net10.0).
- **Trim safe, enforced**: `IsTrimmable`, the trim analyzer runs on every build with IL warnings as errors, and an
  embedded `ILLink.Descriptors.xml` keeps the members the marshaller builds by reflection. Verified on a
  `TrimMode=full` publish of the demo (without the descriptor, `AdbSync.Readdir`'s return path threw
  `MissingConstructor_Name, AdbSyncEntry`).

### Fixed

- `ScrcpyInjectTouchControlMessage.PointerId` and `ScrcpySetClipboardControlMessage.Sequence` are
  `System.Numerics.BigInteger` (were `long`). Tango writes them with `setUint64`, which needs a JS `BigInt`; a `long`
  crossed as a JS number and `InjectTouch` threw `TypeError: Cannot mix BigInt and other types`. A `long` still
  converts implicitly.
- `AdbSyncStat.Size` / `.Mtime` read both the v2 stat's `BigInt` and the v1 stat's number (including `0n`).
- `Logcat.JoinLogId` / `GetLogSize` / `Clear` pass the log ids as numbers.
- Demo: Install APK streams the picked `File` straight to the device (the old page copied the APK into .NET and back);
  the Files page releases the JS handles of each listing it replaces.

### Tests

- The demo's Verification page checks every wrapped export plus marshalling round trips (banner parse, logcat
  statics, BigInt sizes incl. `0n` and > 2^32, wrapper arrays, InjectTouch bytes, Tango events). The Playwright
  test runs it against `dotnet run` or, with `TANGOADB_TEST_URL`, a static serve of a trimmed publish.

### Bundled @yume-chan versions

`@yume-chan/adb` 2.6.0, `adb-daemon-webusb` 2.3.2, `adb-credential-web` 2.1.0, `android-bin` 2.1.0,
`scrcpy` 2.3.0, `adb-scrcpy` 2.3.2, `scrcpy-decoder-webcodecs` 2.5.3, `scrcpy-decoder-tinyh264` 2.1.0,
`stream-extra` 2.6.1, `struct` 2.3.2, `event` 2.0.0. scrcpy server: 3.3.1.

### Requirements

- A Chromium-based browser (Chrome / Edge / Opera) over a **secure context** (HTTPS, or `localhost`).
- SpawnDev.SpawnJS 3.0.0; net10.0. Blazor apps also use SpawnDev.SpawnJS.Blazor.
