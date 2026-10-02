# Power & reboot

Reboot and power commands are on `adb.Power`. Each returns the device's response text.

```csharp
await adb.Power.Reboot();          // normal reboot
await adb.Power.Reboot("recovery");// reboot into a named mode
await adb.Power.Recovery();        // reboot to recovery
await adb.Power.Bootloader();      // reboot to bootloader
await adb.Power.Fastboot();        // reboot to fastboot
await adb.Power.Sideload();        // reboot to sideload
await adb.Power.PowerOff();        // power off
await adb.Power.PowerButton();     // simulate a power-button press
await adb.Power.PowerButton(longPress: true);
```

Device-specific:

```csharp
await adb.Power.QualcommEdlMode(); // Qualcomm EDL (some Qualcomm devices)
await adb.Power.SamsungOdin();     // Samsung Odin download mode
```

A reboot drops the connection - `adb.Disconnected` completes shortly after. Confirm destructive
actions in your UI; these take effect immediately.

```csharp
if (await Confirm("Reboot the device?"))
    await adb.Power.Reboot();
```
