import { Buffer } from "buffer";
// This needs to be done because some libraries are using the global object instead of the window object.
// This is because webpack polyfills global to window by default however vite does not.
// So we need to do this polyfill ourselves.
// Also this issue only shows us when we build to a single js file and stop the chucking.
// This is probably because we are overriding some libraries polyfill during the rollup process.
if (typeof window.global === "undefined") {
  window.global = window;
}

// Same reason as above but for Buffer.
if (typeof window.Buffer === "undefined") {
  window.Buffer = Buffer;
}
