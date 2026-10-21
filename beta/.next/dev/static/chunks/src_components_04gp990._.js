(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/context-file-input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContextFileInput",
    ()=>ContextFileInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/camera.mjs [app-client] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-up.mjs [app-client] (ecmascript) <export default as FileUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.mjs [app-client] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$presentation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Presentation$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/presentation.mjs [app-client] (ecmascript) <export default as Presentation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.mjs [app-client] (ecmascript) <export default as Square>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ContextFileInput({ purpose, onExtract, disabled = false }) {
    _s();
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [recording, setRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), camera = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), slides = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), recorder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), alive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ContextFileInput.useEffect": ()=>{
            alive.current = true;
            return ({
                "ContextFileInput.useEffect": ()=>{
                    alive.current = false;
                    if (timer.current) clearTimeout(timer.current);
                    const r = recorder.current;
                    if (r) {
                        r.onstop = null;
                        if (r.state !== "inactive") r.stop();
                        r.stream.getTracks().forEach({
                            "ContextFileInput.useEffect": (t)=>t.stop()
                        }["ContextFileInput.useEffect"]);
                    }
                }
            })["ContextFileInput.useEffect"];
        }
    }["ContextFileInput.useEffect"], []);
    async function extract(file) {
        if (!file || busy || !alive.current) return;
        if (file.size > 3 * 1024 * 1024) {
            setError("Choose a file smaller than 3 MB.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            const body = new FormData();
            body.set("purpose", purpose);
            body.set("file", file);
            const response = await fetch("/api/context-extract", {
                method: "POST",
                body
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "File processing failed.");
            if (alive.current) onExtract(result.content, result.sourceName);
        } catch (e) {
            if (alive.current) setError(e instanceof Error ? e.message : "The file could not be read.");
        } finally{
            if (alive.current) setBusy(false);
        }
    }
    async function microphone() {
        if (recording) {
            recorder.current?.stop();
            return;
        }
        setError("");
        try {
            if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Recording is not available in this browser. You can upload an audio file.");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            if (!alive.current) {
                stream.getTracks().forEach((t)=>t.stop());
                return;
            }
            const r = new MediaRecorder(stream), chunks = [];
            recorder.current = r;
            r.ondataavailable = (e)=>{
                if (e.data.size) chunks.push(e.data);
            };
            r.onstop = ()=>{
                if (timer.current) clearTimeout(timer.current);
                stream.getTracks().forEach((t)=>t.stop());
                if (!alive.current) return;
                setRecording(false);
                void extract(new File(chunks, "Voice note", {
                    type: r.mimeType
                }));
            };
            r.onerror = ()=>{
                stream.getTracks().forEach((t)=>t.stop());
                if (alive.current) {
                    setRecording(false);
                    setError("Recording stopped unexpectedly. Please try again.");
                }
            };
            r.start();
            setRecording(true);
            timer.current = setTimeout(()=>{
                if (r.state !== "inactive") r.stop();
            }, 60000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Microphone access was not granted.");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "context-input",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "context-tools",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        title: recording ? "Stop recording" : "Record voice note (up to one minute)",
                        "aria-label": recording ? "Stop recording" : "Record voice note",
                        disabled: disabled || busy,
                        onClick: microphone,
                        children: recording ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/src/components/context-file-input.tsx",
                            lineNumber: 31,
                            columnNumber: 285
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/src/components/context-file-input.tsx",
                            lineNumber: 31,
                            columnNumber: 305
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 71
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        title: "Upload file",
                        "aria-label": "Upload file",
                        disabled: disabled || busy || recording,
                        onClick: ()=>input.current?.click(),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileUp$3e$__["FileUp"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/src/components/context-file-input.tsx",
                            lineNumber: 31,
                            columnNumber: 472
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 331
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        title: "Upload presentation as PDF",
                        "aria-label": "Upload presentation as PDF",
                        disabled: disabled || busy || recording,
                        onClick: ()=>slides.current?.click(),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$presentation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Presentation$3e$__["Presentation"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/src/components/context-file-input.tsx",
                            lineNumber: 31,
                            columnNumber: 672
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 500
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        title: "Take or upload photo",
                        "aria-label": "Take or upload photo",
                        disabled: disabled || busy || recording,
                        onClick: ()=>camera.current?.click(),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/src/components/context-file-input.tsx",
                            lineNumber: 31,
                            columnNumber: 866
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 706
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: input,
                        hidden: true,
                        type: "file",
                        accept: "application/pdf,text/plain,text/csv,image/png,image/jpeg,image/webp,audio/*",
                        onChange: (e)=>{
                            void extract(e.target.files?.[0]);
                            e.target.value = "";
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 894
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: slides,
                        hidden: true,
                        type: "file",
                        accept: "application/pdf",
                        onChange: (e)=>{
                            void extract(e.target.files?.[0]);
                            e.target.value = "";
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 1087
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: camera,
                        hidden: true,
                        type: "file",
                        accept: "image/*",
                        capture: "environment",
                        onChange: (e)=>{
                            void extract(e.target.files?.[0]);
                            e.target.value = "";
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 1221
                    }, this),
                    recording && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        role: "status",
                        children: "Recording..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 1381
                    }, this),
                    busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        role: "status",
                        children: "Reading file..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/context-file-input.tsx",
                        lineNumber: 31,
                        columnNumber: 1428
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/context-file-input.tsx",
                lineNumber: 31,
                columnNumber: 40
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "form-message",
                role: "alert",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/context-file-input.tsx",
                lineNumber: 31,
                columnNumber: 1485
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/context-file-input.tsx",
        lineNumber: 31,
        columnNumber: 9
    }, this);
}
_s(ContextFileInput, "hQlBW8AmBl/ZpxAWlHtr0BD1Sb8=");
_c = ContextFileInput;
var _c;
__turbopack_context__.k.register(_c, "ContextFileInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/fielded-dialogue.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FieldedDialogue",
    ()=>FieldedDialogue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.mjs [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.mjs [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$keyhole$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockKeyhole$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-keyhole.mjs [app-client] (ecmascript) <export default as LockKeyhole>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$context$2d$file$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/context-file-input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function FieldedDialogue({ userId }) {
    _s();
    const dialog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), open = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false), sending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false), requestId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [inbox, setInbox] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        turns: [],
        unread: 0,
        proactive: false
    }), [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""), [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""), [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FieldedDialogue.useCallback[load]": async ()=>{
            try {
                const response = await fetch("/api/dialogue", {
                    cache: "no-store"
                });
                if (!response.ok) throw new Error("Your dialogue could not be loaded.");
                const data = await response.json();
                setInbox(data);
                if (open.current) {
                    const ids = data.turns.filter({
                        "FieldedDialogue.useCallback[load].ids": (t)=>!t.seen && t.status === "completed"
                    }["FieldedDialogue.useCallback[load].ids"]).map({
                        "FieldedDialogue.useCallback[load].ids": (t)=>t.id
                    }["FieldedDialogue.useCallback[load].ids"]);
                    if (ids.length) {
                        const read = await fetch("/api/dialogue", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "read",
                                ids
                            })
                        });
                        if (read.ok) setInbox({
                            "FieldedDialogue.useCallback[load]": (current)=>({
                                    ...current,
                                    unread: Math.max(0, current.unread - ids.length)
                                })
                        }["FieldedDialogue.useCallback[load]"]);
                    }
                }
            } catch (e) {
                if (open.current) setError(e instanceof Error ? e.message : "Connection interrupted.");
            }
        }
    }["FieldedDialogue.useCallback[load]"], [
        setError,
        setInbox
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FieldedDialogue.useEffect": ()=>{
            const initial = setTimeout({
                "FieldedDialogue.useEffect.initial": ()=>void load()
            }["FieldedDialogue.useEffect.initial"], 0);
            const interval = setInterval({
                "FieldedDialogue.useEffect.interval": ()=>{
                    if (document.visibilityState === "visible") void load();
                }
            }["FieldedDialogue.useEffect.interval"], 60000);
            return ({
                "FieldedDialogue.useEffect": ()=>{
                    clearTimeout(initial);
                    clearInterval(interval);
                }
            })["FieldedDialogue.useEffect"];
        }
    }["FieldedDialogue.useEffect"], [
        load,
        userId
    ]);
    async function send(turn) {
        if (sending.current) return;
        const content = turn?.question || draft.trim();
        if (!content || content.length > 8000) return;
        sending.current = true;
        setBusy(true);
        setError("");
        const id = turn?.id || requestId.current || crypto.randomUUID();
        if (!turn) requestId.current = id;
        try {
            const response = await fetch("/api/dialogue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "send",
                    id,
                    content
                })
            });
            const result = await response.json();
            if (result.saved || response.ok) {
                if (!turn) {
                    setDraft("");
                    requestId.current = null;
                }
                setNotice("");
            }
            if (!response.ok) throw new Error(result.error || "Response failed.");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Connection interrupted. Retry the same message to check its status.");
        } finally{
            sending.current = false;
            setBusy(false);
            await load();
        }
    }
    async function preference(value) {
        const response = await fetch("/api/dialogue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "preferences",
                proactive: value
            })
        });
        if (!response.ok) setError("Your preference could not be saved.");
        else await load();
    }
    async function defer(id, decision) {
        try {
            const response = await fetch("/api/dialogue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "defer",
                    id,
                    decision
                })
            });
            if (!response.ok) throw new Error();
            setNotice(decision === "later" ? "Work-context prompts paused for seven days." : "Fielded will not repeat this context prompt.");
            await load();
        } catch  {
            setError("The prompt preference could not be saved.");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "fielded-chat-launcher",
                "aria-label": `Open Fielded chat${inbox.unread ? `, ${inbox.unread} unread` : ""}`,
                title: "Fielded chat",
                onClick: ()=>{
                    dialog.current?.showModal();
                    open.current = true;
                    setError("");
                    void load();
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "fielded-chat-caption",
                        children: "Fielded"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 30,
                        columnNumber: 240
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                        size: 24
                    }, void 0, false, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 30,
                        columnNumber: 293
                    }, this),
                    inbox.unread > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chat-unread",
                        children: inbox.unread > 99 ? "99+" : inbox.unread
                    }, void 0, false, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 30,
                        columnNumber: 336
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 30,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
                className: "fielded-chat-dialog",
                ref: dialog,
                onClose: ()=>{
                    open.current = false;
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Fielded"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 31,
                                        columnNumber: 104
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$keyhole$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockKeyhole$3e$__["LockKeyhole"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                lineNumber: 31,
                                                columnNumber: 135
                                            }, this),
                                            "Private discussion"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 31,
                                        columnNumber: 128
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 31,
                                columnNumber: 99
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                title: "Close dialogue",
                                "aria-label": "Close dialogue",
                                onClick: ()=>dialog.current?.close(),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                    lineNumber: 31,
                                    columnNumber: 302
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 31,
                                columnNumber: 191
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 31,
                        columnNumber: 91
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "open-dialogue-history",
                        "aria-live": "polite",
                        "aria-busy": busy,
                        children: [
                            !inbox.turns.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Hello. Want to have a quick chat about your work?"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 32,
                                columnNumber: 99
                            }, this),
                            inbox.turns.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    children: [
                                        t.question && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "open-message mine",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                    children: "You"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 244
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: t.question
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 262
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fielded-dialogue.tsx",
                                            lineNumber: 32,
                                            columnNumber: 209
                                        }, this),
                                        t.answer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "open-message",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                    children: t.purpose
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 329
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: t.answer
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 355
                                                }, this),
                                                !t.question && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "page-actions",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "text-link",
                                                            onClick: ()=>void defer(t.id, "later"),
                                                            children: "Not now"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                            lineNumber: 32,
                                                            columnNumber: 416
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "text-link",
                                                            onClick: ()=>void defer(t.id, "unknown"),
                                                            children: "I do not know"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                            lineNumber: 32,
                                                            columnNumber: 515
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 386
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fielded-dialogue.tsx",
                                            lineNumber: 32,
                                            columnNumber: 299
                                        }, this),
                                        t.status !== "completed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "text-link",
                                            disabled: busy,
                                            onClick: ()=>send(t),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 743
                                                }, this),
                                                t.status === "failed" ? "Retry reply" : "Check pending reply"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fielded-dialogue.tsx",
                                            lineNumber: 32,
                                            columnNumber: 661
                                        }, this)
                                    ]
                                }, t.id, true, {
                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                    lineNumber: 32,
                                    columnNumber: 176
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 32,
                        columnNumber: 2
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "open-dialogue-compose",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        children: "Check-in preferences"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 33,
                                        columnNumber: 50
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "policy-choice",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: inbox.proactive,
                                                onChange: (e)=>void preference(e.target.checked)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                lineNumber: 33,
                                                columnNumber: 122
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Allow optional work-context check-ins"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                lineNumber: 33,
                                                columnNumber: 220
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 33,
                                        columnNumber: 89
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogueSchedule, {
                                        schedule: inbox.schedule,
                                        proactive: inbox.proactive,
                                        onSaved: load
                                    }, JSON.stringify(inbox.schedule), false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 33,
                                        columnNumber: 278
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 33,
                                columnNumber: 41
                            }, this),
                            notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "form-message",
                                children: notice
                            }, void 0, false, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 33,
                                columnNumber: 422
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "form-message",
                                role: "alert",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 33,
                                columnNumber: 471
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: (e)=>{
                                    e.preventDefault();
                                    void send();
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "sr-only",
                                        htmlFor: "open-dialogue-draft",
                                        children: "Your message"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 34,
                                        columnNumber: 56
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        id: "open-dialogue-draft",
                                        value: draft,
                                        maxLength: 8000,
                                        rows: 3,
                                        placeholder: "What is on your mind?",
                                        disabled: busy,
                                        onChange: (e)=>{
                                            setDraft(e.target.value);
                                            requestId.current = null;
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 34,
                                        columnNumber: 133
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "open-dialogue-toolbar",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$context$2d$file$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ContextFileInput"], {
                                                purpose: "dialogue",
                                                disabled: busy,
                                                onExtract: (text, name)=>{
                                                    if (text.length > 8000) {
                                                        setError("This file exceeds the message limit. Use a shorter excerpt or file.");
                                                        return;
                                                    }
                                                    setDraft(text);
                                                    requestId.current = null;
                                                    setNotice(`Review the extracted text from ${name} before sending. The original file is not retained.`);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                lineNumber: 34,
                                                columnNumber: 365
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                className: "button button-primary",
                                                title: "Send message",
                                                "aria-label": "Send message",
                                                disabled: busy || !draft.trim(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                    lineNumber: 34,
                                                    columnNumber: 831
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                                lineNumber: 34,
                                                columnNumber: 697
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 34,
                                        columnNumber: 326
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 34,
                                columnNumber: 2
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/app/suggestions",
                                        children: "Suggest a mission"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 34,
                                        columnNumber: 878
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/app/profile",
                                        children: "My Profile"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 34,
                                        columnNumber: 932
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/app/conversations",
                                        children: "My discussions"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                                        lineNumber: 34,
                                        columnNumber: 975
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 34,
                                columnNumber: 870
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 33,
                        columnNumber: 2
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 31,
                columnNumber: 2
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fielded-dialogue.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
_s(FieldedDialogue, "vh4zVHfUyFv2lFxHwWdX98SiUW4=");
_c = FieldedDialogue;
function DialogueSchedule({ schedule, proactive, onSaved }) {
    _s1();
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""), [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "stack-form",
        onSubmit: async (e)=>{
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            try {
                const response = await fetch("/api/dialogue", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action: "schedule",
                        proactive,
                        zone: form.get("zone"),
                        start: Number(form.get("start")),
                        end: Number(form.get("end")),
                        weekdays: form.get("weekdays") === "on"
                    })
                });
                if (!response.ok) throw new Error();
                await onSaved();
            } catch  {
                setError("Choose a valid timezone and an end hour after the start hour.");
            } finally{
                setBusy(false);
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                children: [
                    "Timezone",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "zone",
                        defaultValue: schedule?.zone || "UTC",
                        placeholder: "Europe/London",
                        required: true,
                        maxLength: 100
                    }, void 0, false, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 40,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 40,
                columnNumber: 2
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "company-field-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            "From hour",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "start",
                                type: "number",
                                min: 0,
                                max: 23,
                                defaultValue: schedule?.start ?? 9,
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 40,
                                columnNumber: 187
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 40,
                        columnNumber: 171
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            "Until hour",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "end",
                                type: "number",
                                min: 1,
                                max: 24,
                                defaultValue: schedule?.end ?? 17,
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/fielded-dialogue.tsx",
                                lineNumber: 40,
                                columnNumber: 307
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 40,
                        columnNumber: 290
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 40,
                columnNumber: 135
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "company-checkbox",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "weekdays",
                        type: "checkbox",
                        defaultChecked: schedule?.weekdays ?? true
                    }, void 0, false, {
                        fileName: "[project]/src/components/fielded-dialogue.tsx",
                        lineNumber: 40,
                        columnNumber: 449
                    }, this),
                    "Weekdays only"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 40,
                columnNumber: 413
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 40,
                columnNumber: 560
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button button-quiet",
                disabled: busy,
                children: "Save quiet hours"
            }, void 0, false, {
                fileName: "[project]/src/components/fielded-dialogue.tsx",
                lineNumber: 40,
                columnNumber: 588
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fielded-dialogue.tsx",
        lineNumber: 39,
        columnNumber: 9
    }, this);
}
_s1(DialogueSchedule, "nFuu9G5zbNh+dEiIHTdibOBvzF0=");
_c1 = DialogueSchedule;
var _c, _c1;
__turbopack_context__.k.register(_c, "FieldedDialogue");
__turbopack_context__.k.register(_c1, "DialogueSchedule");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/refresh-workspace.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RefreshWorkspace",
    ()=>RefreshWorkspace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-client] (ecmascript) <export default as RefreshCw>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RefreshWorkspace() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [pending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RefreshWorkspace.useEffect": ()=>{
            const refresh = {
                "RefreshWorkspace.useEffect.refresh": ()=>{
                    if (document.visibilityState !== "visible" || document.activeElement?.matches("input,textarea,select,[contenteditable=true]")) return;
                    startTransition({
                        "RefreshWorkspace.useEffect.refresh": ()=>router.refresh()
                    }["RefreshWorkspace.useEffect.refresh"]);
                }
            }["RefreshWorkspace.useEffect.refresh"];
            const timer = window.setInterval(refresh, 60000);
            window.addEventListener("focus", refresh);
            return ({
                "RefreshWorkspace.useEffect": ()=>{
                    window.clearInterval(timer);
                    window.removeEventListener("focus", refresh);
                }
            })["RefreshWorkspace.useEffect"];
        }
    }["RefreshWorkspace.useEffect"], [
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: "icon-button",
        type: "button",
        disabled: pending,
        title: "Refresh workspace",
        "aria-label": "Refresh workspace",
        onClick: ()=>startTransition(()=>router.refresh()),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
            size: 16,
            className: pending ? "spin" : undefined
        }, void 0, false, {
            fileName: "[project]/src/components/refresh-workspace.tsx",
            lineNumber: 20,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/refresh-workspace.tsx",
        lineNumber: 19,
        columnNumber: 10
    }, this);
}
_s(RefreshWorkspace, "k5PV7aNOX1Rp49Y2o6RN3rB+YVc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"]
    ];
});
_c = RefreshWorkspace;
var _c;
__turbopack_context__.k.register(_c, "RefreshWorkspace");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/workspace-navigation.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceNavigation",
    ()=>WorkspaceNavigation,
    "WorkspaceSectionTabs",
    ()=>WorkspaceSectionTabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.mjs [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.mjs [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.mjs [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.mjs [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square-text.mjs [app-client] (ecmascript) <export default as MessageSquareText>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const missions = [
    "/app/missions",
    "/app/intelligence",
    "/app/investigations",
    "/app/publishing",
    "/app/follow-ups"
];
const personal = [
    "/app/my-day",
    "/app/conversations",
    "/app/updates",
    "/app/communications/respond",
    "/app/profile",
    "/app/suggestions",
    "/app/concerns"
];
const match = (path, base)=>path === base || path.startsWith(`${base}/`);
function WorkspaceNavigation({ management, company, mobile = false }) {
    _s();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const myWork = !management || personal.some((base)=>match(path, base));
    const items = myWork ? [
        {
            label: "My Day",
            href: "/app/my-day",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
            active: path === "/app/my-day" || path === "/app"
        },
        {
            label: "Discussions",
            href: "/app/conversations",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquareText$3e$__["MessageSquareText"],
            active: match(path, "/app/conversations")
        },
        {
            label: "Updates",
            href: "/app/updates",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"],
            active: match(path, "/app/updates") || match(path, "/app/communications/respond")
        }
    ] : [
        {
            label: "Dashboard",
            href: "/app",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
            active: path === "/app"
        },
        {
            label: "Missions",
            href: "/app/missions",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"],
            active: missions.some((base)=>match(path, base))
        },
        {
            label: "Communications",
            href: "/app/communications",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"],
            active: match(path, "/app/communications")
        }
    ];
    if (company) items.push({
        label: "Company",
        href: "/app/company",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
        active: match(path, "/app/company") || path === "/app/people"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            management && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: mobile ? "workspace-mode mobile-workspace-mode" : "workspace-mode",
                "aria-label": mobile ? "Mobile workspace view" : "Workspace view",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/app/my-day",
                        "aria-current": myWork ? "page" : undefined,
                        children: "My Work"
                    }, void 0, false, {
                        fileName: "[project]/src/components/workspace-navigation.tsx",
                        lineNumber: 25,
                        columnNumber: 176
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/app",
                        "aria-current": !myWork ? "page" : undefined,
                        children: "Manage"
                    }, void 0, false, {
                        fileName: "[project]/src/components/workspace-navigation.tsx",
                        lineNumber: 25,
                        columnNumber: 258
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/workspace-navigation.tsx",
                lineNumber: 25,
                columnNumber: 27
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: mobile ? "mobile-workspace-nav" : "primary-nav",
                "aria-label": mobile ? "Mobile workspace" : "Workspace",
                children: items.map(({ label, href, icon: Icon, active })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: href,
                        "aria-current": active ? "page" : undefined,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/src/components/workspace-navigation.tsx",
                                lineNumber: 25,
                                columnNumber: 584
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/src/components/workspace-navigation.tsx",
                                lineNumber: 25,
                                columnNumber: 602
                            }, this)
                        ]
                    }, href, true, {
                        fileName: "[project]/src/components/workspace-navigation.tsx",
                        lineNumber: 25,
                        columnNumber: 512
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/workspace-navigation.tsx",
                lineNumber: 25,
                columnNumber: 340
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/workspace-navigation.tsx",
        lineNumber: 25,
        columnNumber: 10
    }, this);
}
_s(WorkspaceNavigation, "kx72sda92+XlSh1QiZvq/YVQxpY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = WorkspaceNavigation;
function WorkspaceSectionTabs({ management }) {
    _s1();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const mission = management && missions.some((base)=>match(path, base));
    const communication = management && match(path, "/app/communications") && !match(path, "/app/communications/respond");
    const items = mission ? [
        [
            "/app/missions",
            "Portfolio"
        ],
        [
            "/app/intelligence",
            "Intelligence"
        ],
        [
            "/app/investigations",
            "Investigations"
        ],
        [
            "/app/follow-ups",
            "Follow-up work"
        ],
        [
            "/app/publishing",
            "Approvals"
        ]
    ] : communication ? [
        [
            "/app/communications",
            "Communications"
        ],
        [
            "/app/communications/new",
            "New communication"
        ],
        [
            "/app/publishing",
            "Approvals"
        ]
    ] : [];
    if (!items.length) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "section-tabs work-section-tabs",
        "aria-label": mission ? "Mission sections" : "Communication sections",
        children: items.map(([href, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: href,
                className: path === href || href === "/app/missions" && path.startsWith("/app/missions/") ? "active" : "",
                "aria-current": path === href ? "page" : undefined,
                children: label
            }, href, false, {
                fileName: "[project]/src/components/workspace-navigation.tsx",
                lineNumber: 34,
                columnNumber: 156
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/workspace-navigation.tsx",
        lineNumber: 34,
        columnNumber: 10
    }, this);
}
_s1(WorkspaceSectionTabs, "kx72sda92+XlSh1QiZvq/YVQxpY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c1 = WorkspaceSectionTabs;
var _c, _c1;
__turbopack_context__.k.register(_c, "WorkspaceNavigation");
__turbopack_context__.k.register(_c1, "WorkspaceSectionTabs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_04gp990._.js.map