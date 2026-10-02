using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Radzen;
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.TangoADB;
using SpawnDev.SpawnJS.TangoADB.Demo;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.Services.AddSpawnJSRuntime(out var JS);
builder.Services.AddRadzenComponents();
builder.Services.AddTangoADB();

if (JS.IsWindow)
{
    builder.RootComponents.Add<App>("#app");
    builder.RootComponents.Add<HeadOutlet>("head::after");
}

await builder.Build().SpawnJSRunAsync();
