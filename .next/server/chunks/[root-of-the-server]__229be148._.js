module.exports = {

"[project]/.next-internal/server/app/api/verify/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[externals]/worker_threads [external] (worker_threads, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}}),
"[externals]/util [external] (util, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/punycode [external] (punycode, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/src/app/api/verify/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "POST": ()=>POST
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tesseract$2e$js$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tesseract.js/src/index.js [app-route] (ecmascript)");
;
const extractCnicNumber = (ocrText)=>{
    // It has the format "12345-1234567-1"
    const cnicRegex = /\b\d{5}-\d{7}-\d\b/;
    const match = ocrText.match(cnicRegex);
    if (match) {
        return match[0];
    }
    return null;
};
async function POST(req) {
    try {
        const formData = await req.formData();
        const frontCnic = formData.get("frontCnic");
        const backCnic = formData.get("backCnic");
        console.log("Received files:", {
            frontCnic: frontCnic?.name,
            backCnic: backCnic?.name,
            frontCnicSize: frontCnic?.size,
            backCnicSize: backCnic?.size
        });
        if (!frontCnic || !backCnic) {
            return new Response(JSON.stringify({
                error: "Both front and back CNIC images are required."
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        // Convert File objects to Buffer for Tesseract
        const frontBuffer = Buffer.from(await frontCnic.arrayBuffer());
        const backBuffer = Buffer.from(await backCnic.arrayBuffer());
        const workerFront = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tesseract$2e$js$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createWorker("eng");
        const [frontText, backText] = await Promise.all([
            workerFront.recognize(frontBuffer),
            workerFront.recognize(backBuffer)
        ]);
        // Clean up workers
        await workerFront.terminate();
        await workerFront.terminate();
        console.log("Front CNIC OCR Text:", frontText.data.text);
        console.log("Back CNIC OCR Text:", backText.data.text);
        const frontCnicNumber = extractCnicNumber(frontText.data.text);
        const backCnicNumber = extractCnicNumber(backText.data.text);
        if (!frontCnicNumber || !backCnicNumber) {
            return new Response(JSON.stringify({
                error: "Failed to extract CNIC numbers from the images."
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        if (frontCnicNumber === backCnicNumber) {
            return new Response(JSON.stringify({
                success: true,
                message: "CNIC numbers match.",
                frontCnicNumber,
                backCnicNumber
            }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: "CNIC numbers do not match.",
                frontCnicNumber,
                backCnicNumber
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
    } catch (error) {
        console.error("Error processing CNIC validation:", error);
        return new Response(JSON.stringify({
            success: false,
            error: "Internal server error during CNIC validation."
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__229be148._.js.map