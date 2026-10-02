# Screen mirroring (scrcpy)

scrcpy mirrors the device screen. The flow: push the scrcpy **server** jar to the device, start it,
then decode the video stream into a `<canvas>` with `WebCodecsVideoDecoder` (hardware) or
`TinyH264Decoder` (software fallback).

The scrcpy server binary ships with this package as a static asset
(`_content/SpawnDev.SpawnJS.TangoADB/scrcpy-server`).

## Mirror to a canvas

```razor
@page "/screen"
@using SpawnDev.SpawnJS.JSObjects
@inject SpawnJSRuntime JS

<canvas id="screen" style="max-width:100%;"></canvas>
<button @onclick="Start">Start</button>

@code {
    AdbScrcpyClient? client;
    WebCodecsVideoDecoder? decoder;

    async Task Start()
    {
        if (!WebCodecsVideoDecoder.IsSupported) return;   // browser has no WebCodecs

        // 1. Push the bundled scrcpy server to the device.
        using var response = await JS.Fetch("_content/SpawnDev.SpawnJS.TangoADB/scrcpy-server");
        using var server   = response.Body!;
        await AdbScrcpyClient.PushServer(adb, server);    // default path /data/local/tmp/scrcpy-server.jar

        // 2. Start it (options must declare the server version they target).
        var options = new AdbScrcpyOptionsLatest(
            new ScrcpyOptionsInit(),
            new AdbScrcpyClientOptions { Version = "3.3.1" });
        client = await AdbScrcpyClient.Start(adb, "/data/local/tmp/scrcpy-server.jar", options);

        if (!client.HasVideoStream) return;
        var videoStream = await client.VideoStream;
        var codec       = videoStream.Metadata.Codec;

        // 3. Decode into the canvas.
        using var document = JS.Get<Document>("document");
        var canvas   = document.QuerySelector<HTMLCanvasElement>("#screen")!;
        var renderer = WebGLVideoFrameRenderer.IsSupported
            ? (SpawnJSObject)new WebGLVideoFrameRenderer(canvas)
            : new BitmapVideoFrameRenderer(canvas);

        decoder = new WebCodecsVideoDecoder(new WebCodecsVideoDecoderOptions
        {
            Codec = codec,
            Renderer = renderer,
        });

        // 4. Pipe the demuxed video packets into the decoder (runs until the stream ends).
        _ = videoStream.Stream.PipeTo(decoder.Writable);
    }

    async Task Stop()
    {
        try { decoder?.Release(); } catch { }
        decoder?.Dispose();
        if (client != null) { await client.Close(); client.Dispose(); }
    }
}
```

Live stats while running: `decoder.FramesRendered`, `decoder.FramesSkipped`, `decoder.Width`,
`decoder.Height`, and an `OnSizeChanged` event (returns a `TangoSubscription`).

## Audio and control

`AdbScrcpyClient` also exposes (when enabled in options):

- `HasAudioStream` / `AudioStream` - the audio packet stream.
- `HasController` / `Controller` - a `ScrcpyControlMessageWriter` for injecting input
  (keyboard via `AndroidKeyCode` / `AndroidKeyEventAction`, touch via `AndroidMotionEventAction`,
  scroll, clipboard, UHID).

## Encoders / displays

```csharp
ScrcpyEncoder[] encoders = await AdbScrcpyClient.GetEncoders(adb, path, options);
ScrcpyDisplay[] displays = await AdbScrcpyClient.GetDisplays(adb, path, options);
```

> The **WebCodecs** decoder is the primary path and needs no extra assets. `TinyH264Decoder`
> (software) additionally relies on a WASM worker.
