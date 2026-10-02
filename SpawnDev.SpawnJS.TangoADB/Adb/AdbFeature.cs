namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Known ADB protocol feature flags (the string values the device/client advertise).
    /// Mirrors <c>AdbFeature</c> in @yume-chan/adb.
    /// </summary>
    public static class AdbFeature
    {
        /// <summary>shell_v2 - the v2 shell protocol (separate stdout/stderr, exit code).</summary>
        public const string ShellV2 = "shell_v2";
        /// <summary>cmd - the <c>cmd</c> binary is available.</summary>
        public const string Cmd = "cmd";
        /// <summary>stat_v2 - extended stat with full metadata.</summary>
        public const string StatV2 = "stat_v2";
        /// <summary>ls_v2 - extended directory listing.</summary>
        public const string ListV2 = "ls_v2";
        /// <summary>fixed_push_mkdir - push creates parent directories.</summary>
        public const string FixedPushMkdir = "fixed_push_mkdir";
        /// <summary>abb - activity broker binary.</summary>
        public const string Abb = "abb";
        /// <summary>abb_exec - activity broker exec.</summary>
        public const string AbbExec = "abb_exec";
        /// <summary>sendrecv_v2 - extended sync send/receive.</summary>
        public const string SendReceiveV2 = "sendrecv_v2";
        /// <summary>delayed_ack - delayed acknowledgement (Android 14+).</summary>
        public const string DelayedAck = "delayed_ack";
    }
}
