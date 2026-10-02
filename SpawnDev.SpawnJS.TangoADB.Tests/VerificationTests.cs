using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace SpawnDev.SpawnJS.TangoADB.Tests;

/// <summary>
/// Drives the demo's Wrapper Verification page in a real Chromium browser. This exercises the
/// production bundle load (<c>Tango.Init</c> -> dynamic import of tango-adb.js) and confirms that
/// every wrapped C# class maps to a resolvable export on the <c>TangoADB</c> global. No device is
/// required - this is the honestly-automatable slice of the library's behaviour.
/// </summary>
[TestFixture]
public class VerificationTests : PageTest
{
    [Test]
    public async Task AllWrapperExportsResolve()
    {
        // The browser console is the only place a boot failure shows; forward it so a failure names its cause.
        Page.Console += (_, msg) => TestContext.Progress.WriteLine($"[console.{msg.Type}] {msg.Text}");
        Page.PageError += (_, error) => TestContext.Progress.WriteLine($"[pageerror] {error}");

        await Page.GotoAsync($"{DemoServerFixture.BaseUrl}/verification", new()
        {
            WaitUntil = WaitUntilState.NetworkIdle,
            Timeout = 60_000,
        });

        // ClickAsync auto-waits for the button to be actionable, which also covers Blazor WASM boot.
        await Page.GetByRole(AriaRole.Button, new() { Name = "Run checks" })
            .ClickAsync(new() { Timeout = 90_000 });

        // The result badge reads "<passed>/<total> passed".
        var badge = Page.Locator("text=/\\d+\\/\\d+ passed/");
        await Expect(badge).ToBeVisibleAsync(new() { Timeout = 30_000 });
        var badgeText = (await badge.First.InnerTextAsync()).Trim();

        // Every row of the results grid: name, result, detail. Printed so a failure names its cause.
        var rows = await Page.Locator(".rz-data-row").AllInnerTextsAsync();
        foreach (var row in rows) TestContext.Progress.WriteLine(row.Replace('\n', ' ').Replace('\t', ' '));
        Assert.That(rows.Count, Is.GreaterThan(20), "The results grid did not render its rows.");

        // No export may be reported MISSING and no marshalling check may FAIL.
        var missing = await Page.GetByText("MISSING", new() { Exact = true }).CountAsync();
        Assert.That(missing, Is.Zero, $"{missing} wrapped export(s) did not resolve. Badge: '{badgeText}'");
        var failedChecks = await Page.GetByText("FAIL", new() { Exact = true }).CountAsync();
        Assert.That(failedChecks, Is.Zero, $"{failedChecks} marshalling check(s) failed. Badge: '{badgeText}'");

        // And passed count must equal total count (Radzen renders the badge text uppercased).
        var m = Regex.Match(badgeText, @"(\d+)/(\d+)\s+passed", RegexOptions.IgnoreCase);
        Assert.That(m.Success, Is.True, $"Unexpected badge text: '{badgeText}'");
        Assert.That(m.Groups[1].Value, Is.EqualTo(m.Groups[2].Value), $"Not all checks passed: '{badgeText}'");
    }
}
