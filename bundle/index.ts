// Bundle entry for SpawnDev.SpawnJS.TangoADB.
// Re-exports the @yume-chan Tango ADB packages into a single ESM module that is
// imported by the C# wrapper via JS.Import<Tango>("TangoADB", "./_content/.../tango-adb.js").
//
// Namespacing rationale:
//   - Core packages (adb, adb-daemon-webusb, credential) expose distinct, central names
//     and are re-exported at the top level so C# can do JS.New("TangoADB.Adb", ...).
//   - scrcpy / adb-scrcpy / android-bin export many VERSIONED symbols (1_15 .. 3_3_3 + latest)
//     that collide under `export *`, so each is exported under its own namespace object.
//     C# then reaches them via JS.New("TangoADB.Scrcpy.X") / "TangoADB.AndroidBin.PackageManager" etc.

// --- Core ADB (top level) ---
export * from "@yume-chan/adb";
export * from "@yume-chan/adb-daemon-webusb";
export { default as AdbWebCredentialStore } from "@yume-chan/adb-credential-web";

// --- Android command-line utilities (pm/settings/am/bu/...) ---
export * as AndroidBin from "@yume-chan/android-bin";

// --- scrcpy screen mirroring (namespaced - versioned symbols) ---
export * as Scrcpy from "@yume-chan/scrcpy";
export * as AdbScrcpy from "@yume-chan/adb-scrcpy";

// --- scrcpy video decoders + the WebCodecs frame renderers (renderer is required to
//     construct WebCodecsVideoDecoder, so all four renderer classes are exported too) ---
export {
    WebCodecsVideoDecoder,
    CanvasVideoFrameRenderer,
    BitmapVideoFrameRenderer,
    WebGLVideoFrameRenderer,
    InsertableStreamVideoFrameRenderer,
} from "@yume-chan/scrcpy-decoder-webcodecs";
export { TinyH264Decoder } from "@yume-chan/scrcpy-decoder-tinyh264";

// --- Supporting libraries (namespaced) ---
export * as StreamExtra from "@yume-chan/stream-extra";
export * as Struct from "@yume-chan/struct";
export * as Event from "@yume-chan/event";
