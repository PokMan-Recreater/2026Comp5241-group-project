# Code execution

Local browser checks (2026-11-01, small examples, not a performance guarantee): Python stdin/sum-of-squares returned 55, initial load 13.22 s, repeated run 0.07 s. C returned 55 after stdin 5; with worker asset reuse, repeated runs measured 0.69 s and 3.26 s. Invalid C `kc` produced Clang diagnostics in 0.36 s. C++ vector/iostream output `2 4 6` verified. First C/C++ environment initialization took roughly 24–47 s in these checks. Python infinite loop was terminated by the 8-second execution timeout, without freezing the page. Automated tests separately check explicit stop, timeout and retry.

The free coding area defaults to real **browser execution**, including on publicly deployed static sites: C/C++ use Clang/LLVM via browsercc 0.1.1 and browser_wasi_shim 0.4.2; Python uses CPython via Pyodide 0.27.7. Version-pinned runtime files download from jsDelivr. JS uses the existing worker; HTML uses the existing isolated preview. No database or execution backend is needed for browser mode.

## Browser mode (default)

First run downloads the runtime (C/C++ about 95 MB uncompressed, optional PCH not loaded). Later runs reuse the environment during the current browser document lifetime, including idle UI rerenders, example changes and SPA navigation. A UI rerender cancels/destroys a busy worker, but preserves an idle one. Explicit Stop, execution timeout and full page reload discard the execution environment, not the versioned runtime-resource cache. Python globals are fresh per run, but imported modules and virtual files persist until worker disposal. Built-in examples include only the headers they need; learner code is never rewritten.

### Refresh-safe resource cache

The trusted application page keeps an explicit Cache Storage cache (`forma-runtime-assets-v1`) for exactly six fixed URLs: browsercc's Clang/LLD wasm and sysroot, plus Pyodide's wasm, stdlib ZIP and lock JSON. An opaque worker asks for one of these allowlisted assets through its sandbox frame. The page fetches with credentials omitted, caches only successful bounded responses and returns bytes; it cannot be used as an arbitrary URL/application-API proxy. Source, stdin, output, API keys and executable job state are never cached here. Small JS module imports still use ordinary browser HTTP caching. This is not a full offline-site guarantee.

A refresh recreates the worker and initializes WebAssembly, but large assets can now be restored from Cache Storage instead of redownloaded. UI reports cache hits. Cache API denial, quota exhaustion or eviction degrades to ordinary loading; clearing site data or private browsing may require downloading again. Download already in flight at cancellation may finish populating this fixed public-resource cache, but its response cannot restart or update a canceled job. Initialization/compilation time still depends on hardware and code. HTTPS or localhost is required for Cache Storage.

Browser refresh check (2026-11-02): C++ RAII example first cache-populating run 30.84 s; after a real browser refresh, 4.78 s with a displayed Cache Storage hit and output `Saved`. Python values example returned `True`/`False` in 5.79 s initially, then 2.76 s after refresh with a displayed cache hit. These are observations on one device/network, not performance guarantees; small JS module downloads/initialization remain.

An opaque-origin sandbox frame owns the worker: no application DOM/storage access. CSP permits runtime downloads from jsDelivr only, not application APIs/arbitrary hosts. Python JS interop remains available inside that isolated worker; do not put secret tests or credentials there. This is not OS-grade memory isolation: excessive allocations can still exhaust browser memory.

Source/input limits: 60,000/10,000 characters. Output capped at 24,000 characters. Loading/compilation deadline 180 seconds; execution deadline 8 seconds. Stop terminates the worker; changing routes during a run also stops it. Each run has its own ID/progress callback: stale events cannot overwrite a new run, and elapsed time belongs to the current job. Warm C/C++ jobs show compiling rather than claiming they are first-load downloads. C/C++ target WASI, not native OS APIs; threading and C++ exceptions are unsupported. Pre-entered stdin ends at EOF. No live terminal or persistent disk.

C/C++ receive a fresh WASI in-memory working directory on every execution for teaching examples such as `fopen` and `fstream`. Files are discarded after the execution; no visitor files are read or written. The RAII example explicitly includes `<fstream>`, `<string>` and `<iostream>` for file streams, strings and console output.

Forma does not send submitted source/input to a compilation API in browser mode. CDN requests still disclose ordinary connection metadata. Remote execution is **explicit opt-in**, never automatic fallback. These runtimes are open source, not a paid execution API; website hosting/traffic may still incur costs. If vendoring, preserve upstream licenses and bundled notices (browsercc MIT, browser_wasi_shim MIT/Apache-2.0, Pyodide MPL-2.0 plus third-party terms).

## Explicit remote backup

Selecting remote backup uses GCC 13.2 / CPython 3.12.7 through Wandbox. The following proxy rules apply only to that mode.

`POST /api/run` forwards only the selected language, source and standard input to `https://wandbox.org/api/compile.json`, with `save: false`. Code is transmitted to a third party; the UI states this before running. This does not assert that the provider keeps no operational logs. Never submit secrets. The application does not execute native programs on its own host.

Complete C/C++ programs need their headers and `main`. The standard input field supports `scanf`, `cin` and `input()` with pre-entered input; there is no live terminal, package installer or persistent filesystem. Compiler diagnostics, standard output, standard error, nonzero exits and termination signals are displayed. Service/network failures are errors and never fall back to simulated output.

The proxy allows 12 requests per minute per IP per process, limits source to 60,000 characters and input to 10,000, and times out upstream requests after 25 seconds. These are prototype safeguards, not durable account quotas. Provider resource limits also apply. A timeout aborts the HTTP request, not necessarily the remote job.

The local server and Vercel both route `/api/run`. No API key is needed for the currently tested public endpoint. Remote backup needs an available Wandbox service; a static-only host needs a separately hosted proxy to use backup. Stop cancels waiting, not necessarily the remote job. For a high-traffic release, arrange a suitable dedicated execution service and authenticated quotas. This change does not deploy or push the site.
