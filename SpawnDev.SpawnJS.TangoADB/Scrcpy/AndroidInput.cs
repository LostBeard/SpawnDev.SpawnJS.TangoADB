namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Android <c>KeyEvent</c> action (key down / up) used when injecting key events via
    /// <see cref="ScrcpyControlMessageWriter.InjectKeyCode"/>. Mirrors <c>AndroidKeyEventAction</c>.
    /// </summary>
    public enum AndroidKeyEventAction
    {
        /// <summary>The key was pressed down.</summary>
        Down = 0,
        /// <summary>The key was released.</summary>
        Up = 1,
    }

    /// <summary>
    /// Android key-event meta/modifier state bit flags (combine with bitwise OR). Mirrors
    /// <c>AndroidKeyEventMeta</c>. Used as the <c>metaState</c> of an injected key event.
    /// </summary>
    [System.Flags]
    public enum AndroidKeyEventMeta
    {
        /// <summary>No modifiers.</summary>
        None = 0,
        /// <summary>Either Alt key.</summary>
        Alt = 2,
        /// <summary>Left Alt.</summary>
        AltLeft = 16,
        /// <summary>Right Alt.</summary>
        AltRight = 32,
        /// <summary>Either Shift key.</summary>
        Shift = 1,
        /// <summary>Left Shift.</summary>
        ShiftLeft = 64,
        /// <summary>Right Shift.</summary>
        ShiftRight = 128,
        /// <summary>Either Ctrl key.</summary>
        Ctrl = 4096,
        /// <summary>Left Ctrl.</summary>
        CtrlLeft = 8192,
        /// <summary>Right Ctrl.</summary>
        CtrlRight = 16384,
        /// <summary>Either Meta (Super/Windows) key.</summary>
        Meta = 65536,
        /// <summary>Left Meta.</summary>
        MetaLeft = 131072,
        /// <summary>Right Meta.</summary>
        MetaRight = 262144,
        /// <summary>Caps Lock is on.</summary>
        CapsLock = 1048576,
        /// <summary>Num Lock is on.</summary>
        NumLock = 2097152,
        /// <summary>Scroll Lock is on.</summary>
        ScrollLock = 4194304,
    }

    /// <summary>
    /// Android <c>KeyEvent</c> key codes (the device-side key identifiers). Mirrors
    /// <c>AndroidKeyCode</c>. Pass as the <c>keyCode</c> of an injected key event.
    /// </summary>
    public enum AndroidKeyCode
    {
        /// <summary>HOME button.</summary>
        AndroidHome = 3,
        /// <summary>BACK button.</summary>
        AndroidBack = 4,
        /// <summary>CALL button.</summary>
        AndroidCall = 5,
        /// <summary>END CALL button.</summary>
        AndroidEndCall = 6,
        /// <summary>'0' key.</summary>
        Digit0 = 7,
        /// <summary>'1' key.</summary>
        Digit1 = 8,
        /// <summary>'2' key.</summary>
        Digit2 = 9,
        /// <summary>'3' key.</summary>
        Digit3 = 10,
        /// <summary>'4' key.</summary>
        Digit4 = 11,
        /// <summary>'5' key.</summary>
        Digit5 = 12,
        /// <summary>'6' key.</summary>
        Digit6 = 13,
        /// <summary>'7' key.</summary>
        Digit7 = 14,
        /// <summary>'8' key.</summary>
        Digit8 = 15,
        /// <summary>'9' key.</summary>
        Digit9 = 16,
        /// <summary>'*' key.</summary>
        Star = 17,
        /// <summary>'#' key.</summary>
        Pound = 18,
        /// <summary>Directional Pad Up.</summary>
        ArrowUp = 19,
        /// <summary>Directional Pad Down.</summary>
        ArrowDown = 20,
        /// <summary>Directional Pad Left.</summary>
        ArrowLeft = 21,
        /// <summary>Directional Pad Right.</summary>
        ArrowRight = 22,
        /// <summary>Directional Pad Center.</summary>
        AndroidDPadCenter = 23,
        /// <summary>Volume Up.</summary>
        VolumeUp = 24,
        /// <summary>Volume Down.</summary>
        VolumeDown = 25,
        /// <summary>Power button.</summary>
        Power = 26,
        /// <summary>Camera button.</summary>
        AndroidCamera = 27,
        /// <summary>Clear.</summary>
        Clear = 28,
        /// <summary>'A' key.</summary>
        KeyA = 29,
        /// <summary>'B' key.</summary>
        KeyB = 30,
        /// <summary>'C' key.</summary>
        KeyC = 31,
        /// <summary>'D' key.</summary>
        KeyD = 32,
        /// <summary>'E' key.</summary>
        KeyE = 33,
        /// <summary>'F' key.</summary>
        KeyF = 34,
        /// <summary>'G' key.</summary>
        KeyG = 35,
        /// <summary>'H' key.</summary>
        KeyH = 36,
        /// <summary>'I' key.</summary>
        KeyI = 37,
        /// <summary>'J' key.</summary>
        KeyJ = 38,
        /// <summary>'K' key.</summary>
        KeyK = 39,
        /// <summary>'L' key.</summary>
        KeyL = 40,
        /// <summary>'M' key.</summary>
        KeyM = 41,
        /// <summary>'N' key.</summary>
        KeyN = 42,
        /// <summary>'O' key.</summary>
        KeyO = 43,
        /// <summary>'P' key.</summary>
        KeyP = 44,
        /// <summary>'Q' key.</summary>
        KeyQ = 45,
        /// <summary>'R' key.</summary>
        KeyR = 46,
        /// <summary>'S' key.</summary>
        KeyS = 47,
        /// <summary>'T' key.</summary>
        KeyT = 48,
        /// <summary>'U' key.</summary>
        KeyU = 49,
        /// <summary>'V' key.</summary>
        KeyV = 50,
        /// <summary>'W' key.</summary>
        KeyW = 51,
        /// <summary>'X' key.</summary>
        KeyX = 52,
        /// <summary>'Y' key.</summary>
        KeyY = 53,
        /// <summary>'Z' key.</summary>
        KeyZ = 54,
        /// <summary>',' key.</summary>
        Comma = 55,
        /// <summary>'.' key.</summary>
        Period = 56,
        /// <summary>Left Alt.</summary>
        AltLeft = 57,
        /// <summary>Right Alt.</summary>
        AltRight = 58,
        /// <summary>Left Shift.</summary>
        ShiftLeft = 59,
        /// <summary>Right Shift.</summary>
        ShiftRight = 60,
        /// <summary>Tab.</summary>
        Tab = 61,
        /// <summary>Space.</summary>
        Space = 62,
        /// <summary>SYM (symbol) modifier.</summary>
        AndroidSymbol = 63,
        /// <summary>Explorer special function.</summary>
        AndroidExplorer = 64,
        /// <summary>Envelope (email) special function.</summary>
        AndroidEnvelope = 65,
        /// <summary>Enter.</summary>
        Enter = 66,
        /// <summary>Backspace (delete to the left).</summary>
        Backspace = 67,
        /// <summary>'`' key.</summary>
        Backquote = 68,
        /// <summary>'-' key.</summary>
        Minus = 69,
        /// <summary>'=' key.</summary>
        Equal = 70,
        /// <summary>'[' key.</summary>
        BracketLeft = 71,
        /// <summary>']' key.</summary>
        BracketRight = 72,
        /// <summary>'\' key.</summary>
        Backslash = 73,
        /// <summary>';' key.</summary>
        Semicolon = 74,
        /// <summary>'\'' key.</summary>
        Quote = 75,
        /// <summary>'/' key.</summary>
        Slash = 76,
        /// <summary>'@' key.</summary>
        At = 77,
        /// <summary>Number modifier.</summary>
        AndroidNum = 78,
        /// <summary>Headset Hook.</summary>
        AndroidHeadsetHook = 79,
        /// <summary>Camera Focus.</summary>
        AndroidFocus = 80,
        /// <summary>'+' key.</summary>
        Plus = 81,
        /// <summary>Menu.</summary>
        ContextMenu = 82,
        /// <summary>Notification.</summary>
        AndroidNotification = 83,
        /// <summary>Search.</summary>
        AndroidSearch = 84,
        /// <summary>Page Up.</summary>
        PageUp = 92,
        /// <summary>Page Down.</summary>
        PageDown = 93,
        /// <summary>Escape.</summary>
        Escape = 111,
        /// <summary>Forward Delete.</summary>
        Delete = 112,
        /// <summary>Left Control.</summary>
        ControlLeft = 113,
        /// <summary>Right Control.</summary>
        ControlRight = 114,
        /// <summary>Caps Lock.</summary>
        CapsLock = 115,
        /// <summary>Scroll Lock.</summary>
        ScrollLock = 116,
        /// <summary>Left Meta.</summary>
        MetaLeft = 117,
        /// <summary>Right Meta.</summary>
        MetaRight = 118,
        /// <summary>Function modifier.</summary>
        AndroidFunction = 119,
        /// <summary>Print Screen / SysRq.</summary>
        PrintScreen = 120,
        /// <summary>Pause / Break.</summary>
        Pause = 121,
        /// <summary>Home (text navigation).</summary>
        Home = 122,
        /// <summary>End (text navigation).</summary>
        End = 123,
        /// <summary>Insert.</summary>
        Insert = 124,
        /// <summary>Forward (navigate forward).</summary>
        AndroidForward = 125,
        /// <summary>F1.</summary>
        F1 = 131,
        /// <summary>F2.</summary>
        F2 = 132,
        /// <summary>F3.</summary>
        F3 = 133,
        /// <summary>F4.</summary>
        F4 = 134,
        /// <summary>F5.</summary>
        F5 = 135,
        /// <summary>F6.</summary>
        F6 = 136,
        /// <summary>F7.</summary>
        F7 = 137,
        /// <summary>F8.</summary>
        F8 = 138,
        /// <summary>F9.</summary>
        F9 = 139,
        /// <summary>F10.</summary>
        F10 = 140,
        /// <summary>F11.</summary>
        F11 = 141,
        /// <summary>F12.</summary>
        F12 = 142,
        /// <summary>Num Lock.</summary>
        NumLock = 143,
        /// <summary>Numpad '0'.</summary>
        Numpad0 = 144,
        /// <summary>Numpad '1'.</summary>
        Numpad1 = 145,
        /// <summary>Numpad '2'.</summary>
        Numpad2 = 146,
        /// <summary>Numpad '3'.</summary>
        Numpad3 = 147,
        /// <summary>Numpad '4'.</summary>
        Numpad4 = 148,
        /// <summary>Numpad '5'.</summary>
        Numpad5 = 149,
        /// <summary>Numpad '6'.</summary>
        Numpad6 = 150,
        /// <summary>Numpad '7'.</summary>
        Numpad7 = 151,
        /// <summary>Numpad '8'.</summary>
        Numpad8 = 152,
        /// <summary>Numpad '9'.</summary>
        Numpad9 = 153,
        /// <summary>Numpad '/'.</summary>
        NumpadDivide = 154,
        /// <summary>Numpad '*'.</summary>
        NumpadMultiply = 155,
        /// <summary>Numpad '-'.</summary>
        NumpadSubtract = 156,
        /// <summary>Numpad '+'.</summary>
        NumpadAdd = 157,
        /// <summary>Numpad '.'.</summary>
        NumpadDecimal = 158,
        /// <summary>Numpad ','.</summary>
        NumpadComma = 159,
        /// <summary>Numpad Enter.</summary>
        NumpadEnter = 160,
        /// <summary>Numpad '='.</summary>
        NumpadEquals = 161,
        /// <summary>Numpad '('.</summary>
        NumpadLeftParen = 162,
        /// <summary>Numpad ')'.</summary>
        NumpadRightParen = 163,
        /// <summary>Volume Mute.</summary>
        VolumeMute = 164,
        /// <summary>App Switch (recent apps).</summary>
        AndroidAppSwitch = 187,
        /// <summary>Cut.</summary>
        AndroidCut = 277,
        /// <summary>Copy.</summary>
        AndroidCopy = 278,
        /// <summary>Paste.</summary>
        AndroidPaste = 279,
    }

    /// <summary>
    /// Android <c>MotionEvent</c> action used when injecting touch events via
    /// <see cref="ScrcpyControlMessageWriter.InjectTouch"/>. Mirrors <c>AndroidMotionEventAction</c>.
    /// </summary>
    public enum AndroidMotionEventAction
    {
        /// <summary>A pressed gesture has started (first pointer down).</summary>
        Down = 0,
        /// <summary>A pressed gesture has finished (last pointer up).</summary>
        Up = 1,
        /// <summary>A change has happened during a press gesture (pointer moved).</summary>
        Move = 2,
        /// <summary>The current gesture has been aborted.</summary>
        Cancel = 3,
        /// <summary>A movement has happened outside of the normal bounds of the UI element.</summary>
        Outside = 4,
        /// <summary>A non-primary pointer has gone down.</summary>
        PointerDown = 5,
        /// <summary>A non-primary pointer has gone up.</summary>
        PointerUp = 6,
        /// <summary>A change happened but the pointer is not down (hover move).</summary>
        HoverMove = 7,
        /// <summary>The motion event contains relative vertical/horizontal scroll values.</summary>
        Scroll = 8,
        /// <summary>The pointer is not down but has entered the bounds of an element (hover enter).</summary>
        HoverEnter = 9,
        /// <summary>The pointer is not down but has exited the bounds of an element (hover exit).</summary>
        HoverExit = 10,
        /// <summary>A button has been pressed.</summary>
        ButtonPress = 11,
        /// <summary>A button has been released.</summary>
        ButtonRelease = 12,
    }

    /// <summary>
    /// Android <c>MotionEvent</c> button state bit flags (combine with bitwise OR). Mirrors
    /// <c>AndroidMotionEventButton</c>. Used as the <c>buttons</c>/<c>actionButton</c> of a touch event.
    /// </summary>
    [System.Flags]
    public enum AndroidMotionEventButton
    {
        /// <summary>No buttons.</summary>
        None = 0,
        /// <summary>Primary button (left mouse / first touch).</summary>
        Primary = 1,
        /// <summary>Secondary button (right mouse).</summary>
        Secondary = 2,
        /// <summary>Tertiary button (middle mouse).</summary>
        Tertiary = 4,
        /// <summary>Back mouse button.</summary>
        Back = 8,
        /// <summary>Forward mouse button.</summary>
        Forward = 16,
        /// <summary>Stylus primary button.</summary>
        StylusPrimary = 32,
        /// <summary>Stylus secondary button.</summary>
        StylusSecondary = 64,
    }

    /// <summary>
    /// Android display/screen power mode. Mirrors <c>AndroidScreenPowerMode</c>. Used with
    /// <see cref="ScrcpyControlMessageWriter.SetScreenPowerMode"/>.
    /// </summary>
    public enum AndroidScreenPowerMode
    {
        /// <summary>Turn the device screen off (mirroring continues).</summary>
        Off = 0,
        /// <summary>Normal screen power.</summary>
        Normal = 2,
    }
}
