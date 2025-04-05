(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/[root of the server]__7fbe6e36._.js", {

"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s({
    "connect": (()=>connect),
    "setHooks": (()=>setHooks),
    "subscribeToUpdate": (()=>subscribeToUpdate)
});
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case "turbopack-connected":
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn("[Fast Refresh] performing full reload\n\n" + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + "You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n" + "Consider migrating the non-React component export to a separate file and importing it into both files.\n\n" + "It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n" + "Fast Refresh requires at least one parent function component in your React tree.");
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error("A separate HMR handler was already registered");
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: "turbopack-subscribe",
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: "turbopack-unsubscribe",
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: "ChunkListUpdate",
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === "added" && updateB.type === "deleted" || updateA.type === "deleted" && updateB.type === "added") {
        return undefined;
    }
    if (updateA.type === "partial") {
        invariant(updateA.instruction, "Partial updates are unsupported");
    }
    if (updateB.type === "partial") {
        invariant(updateB.instruction, "Partial updates are unsupported");
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: "EcmascriptMergedUpdate",
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === "added" && updateB.type === "deleted") {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === "deleted" && updateB.type === "added") {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: "partial",
            added,
            deleted
        };
    }
    if (updateA.type === "partial" && updateB.type === "partial") {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: "partial",
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === "added" && updateB.type === "partial") {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: "added",
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === "partial" && updateB.type === "deleted") {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: "deleted",
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    "bug",
    "error",
    "fatal"
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    "bug",
    "fatal",
    "error",
    "warning",
    "info",
    "log"
];
const CATEGORY_ORDER = [
    "parse",
    "resolve",
    "code generation",
    "rendering",
    "typescript",
    "other"
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case "issues":
            break;
        case "partial":
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === "notFound") {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}}),
"[project]/components/admin/footer/designedby/Designedby.jsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
;
;
;
function Designedby() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `credits pt-0 pb-2`,
            children: [
                "Designed by  ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: `#`,
                    children: " Frank And Hub "
                }, void 0, false, {
                    fileName: "[project]/components/admin/footer/designedby/Designedby.jsx",
                    lineNumber: 8,
                    columnNumber: 30
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/admin/footer/designedby/Designedby.jsx",
            lineNumber: 7,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_c = Designedby;
const __TURBOPACK__default__export__ = Designedby;
var _c;
__turbopack_context__.k.register(_c, "Designedby");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/config.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
const config = {
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_BASE_URL,
    reactUrl: `${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_BASE_URL}:${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_API_PORT}`,
    reactApiUrl: `${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_BASE_URL}:${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_API_PORT}/api`,
    pageignation: `${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_PAGEIGNATION}`
};
const __TURBOPACK__default__export__ = config;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/utils/api.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/config.js [client] (ecmascript)");
;
;
const baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].reactApiUrl;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});
api.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token') ?? null;
    if (token) {
        // console.info('👍');
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error)=>{
    // console.info('👎');
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/admin/comman/notification/Notification.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "notifyError": (()=>notifyError),
    "notifyInfo": (()=>notifyInfo),
    "notifySuccess": (()=>notifySuccess),
    "notifyWarning": (()=>notifyWarning)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-toastify/dist/index.mjs [client] (ecmascript)");
;
;
;
;
const Notification = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["ToastContainer"], {
        position: `top-right`,
        autoClose: 3000,
        hideProgressBar: false,
        newestOnTop: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: false,
        className: `rounded-pill`
    }, void 0, false, {
        fileName: "[project]/components/admin/comman/notification/Notification.js",
        lineNumber: 6,
        columnNumber: 5
    }, this);
_c = Notification;
const notifySuccess = (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].success(message);
const notifyError = (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].error(message);
const notifyInfo = (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].info(message);
const notifyWarning = (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["toast"].warn(message);
const __TURBOPACK__default__export__ = Notification;
var _c;
__turbopack_context__.k.register(_c, "Notification");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/utils/helper.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "checkFileValidation": (()=>checkFileValidation),
    "customStyles": (()=>customStyles),
    "debounce": (()=>debounce),
    "dummyImage": (()=>dummyImage),
    "fetchSelectedOptions": (()=>fetchSelectedOptions),
    "formattedData": (()=>formattedData),
    "generateRandomString": (()=>generateRandomString),
    "getFullName": (()=>getFullName),
    "getToken": (()=>getToken),
    "handleErrorImage": (()=>handleErrorImage),
    "handleToggleSidebar": (()=>handleToggleSidebar),
    "loadCSS": (()=>loadCSS),
    "loadScript": (()=>loadScript),
    "loremPatterns": (()=>loremPatterns),
    "loremTextCheck": (()=>loremTextCheck),
    "lowercase": (()=>lowercase),
    "rasc": (()=>rasc),
    "transformData": (()=>transformData),
    "truncateString": (()=>truncateString),
    "ucwords": (()=>ucwords)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/comman/notification/Notification.js [client] (ecmascript)");
;
const ucwords = (text)=>{
    if (typeof text !== 'string' || text.length === 0) {
        return text;
    }
    return text.replace('_', ' ').split(' ').map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
const lowercase = (text)=>{
    if (typeof text !== 'string' || text.length === 0) {
        return text;
    }
    return text.toLowerCase().split(' ').map((word)=>word.charAt(0).toLowerCase() + word.slice(1)).join(' ');
};
const rasc = (text)=>{
    if (text) {
        const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>-]/g;
        return text.replace(specialCharsRegex, '');
    }
};
const formattedData = (formData)=>{
    return Object.entries(formData).map(([key, value])=>({
            propName: key,
            value: value
        }));
};
const generateRandomString = ()=>{
    const length = Math.floor(Math.random() * (16 - 8 + 1)) + 8;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatedString = '';
    for(let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * charset.length);
        generatedString += charset[randomIndex];
    }
    return generatedString;
};
const truncateString = (str, maxLength = 25)=>{
    if (str && str.length > maxLength) {
        return `${str.slice(0, maxLength)}...`;
    }
    return str;
};
const checkFileValidation = async (e)=>{
    const file = e?.target?.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (!file) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__["notifyError"])('No file selected.');
        return false;
    }
    if (file.size > maxSize) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__["notifyError"])('File size exceeds the maximum limit of 5MB');
        return false;
    }
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/svg',
        'image/web'
    ];
    if (!allowedTypes.includes(file.type)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__["notifyError"])('Invalid file type. Only JPEG and PNG are allowed.');
        return false;
    }
    return true;
};
const transformData = (data)=>{
    const transformed = {};
    Object.keys(data).forEach((key)=>{
        const match = key.match(/^(\w+)\[(\d+)\]$/);
        if (match) {
            const field = match[1];
            const index = parseInt(match[2]);
            if (!transformed[field]) transformed[field] = [];
            transformed[field][index] = data[key];
        } else {
            transformed[key] = data[key];
        }
    });
    return transformed;
};
const debounce = (func, wait)=>{
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(()=>func(...args), wait);
    };
};
const loadCSS = (url)=>{
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
};
const loadScript = (url)=>{
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
};
const customStyles = {
    control: (provided, state)=>({
            ...provided,
            borderRadius: `var(--bs-border-radius)`,
            boxShadow: state.isFocused ? `var(--background)` : `none`
        }),
    option: (provided, state)=>({
            ...provided,
            textAlign: `left`,
            color: state.isSelected ? `var(--white)` : `var(--light)`,
            '& i': {
                color: state.isSelected ? `var(--white)` : `var(--light)`
            }
        }),
    dropdownIndicator: (provided)=>({
            ...provided,
            color: `var(--light)`
        }),
    clearIndicator: (provided)=>({
            ...provided,
            color: `var(--light)`
        }),
    menuList: (provided)=>({
            ...provided,
            animation: 'slideIn 0.5s ease-in-out forwards',
            '&::-webkit-scrollbar': {
                display: 'none'
            },
            scrollbarWidth: 'none'
        })
};
const fetchSelectedOptions = (data)=>{
    const Options = data?.map((val, index)=>({
            value: val?.id,
            label: `${ucwords(val?.name)}`
        }));
    return Options;
};
const getFullName = (name)=>{
    return `${name?.first_name} ${name?.middle_name ? name?.middle_name + ' ' : ''}${name?.last_name}`;
};
const dummyImage = ()=>{
    return `./../../public/admin/img/profile-img.jpg`;
};
const handleErrorImage = (event, defaultImage)=>{
    return event.target.src = defaultImage ?? dummyImage();
};
const loremPatterns = [
    /lorem ipsum/i,
    /dolor sit amet/i,
    /consectetur adipiscing elit/i,
    /sed do eiusmod tempor incididunt/i,
    /ut labore et dolore magna aliqua/i,
    /quis nostrud exercitation ullamco/i,
    /labore et dolore magna aliqua/i
];
const loremTextCheck = (text)=>{
    return loremPatterns.some((pattern)=>pattern.test(text));
// if (isLorem) {
//     return res.status(400).json({ error: 'Error: Please do not use Lorem Ipsum text.' });
// }
};
const handleToggleSidebar = ()=>{
    document.body.classList.toggle('toggle-sidebar');
    const element = document.getElementById('sidebar');
    if (element) {
        if (window.innerWidth >= 1020) {
            element.classList.toggle('my-3');
            element.classList.toggle('mx-2');
        } else {
            console.clear();
        }
    }
};
const getToken = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return localStorage.getItem('token');
    }
    "TURBOPACK unreachable";
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/utils/AxiosUtils.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "destroy": (()=>destroy),
    "get": (()=>get),
    "patch": (()=>patch),
    "post": (()=>post),
    "put": (()=>put)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$api$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/api.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/config.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$helper$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/helper.js [client] (ecmascript)");
;
;
;
const baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].reactApiUrl;
const request = async (method, url, data = {})=>{
    try {
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$helper$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getToken"])();
        const config = {
            method,
            url: baseUrl + url,
            headers: {
                ...token && {
                    Authorization: `Bearer ${token}`
                }
            },
            data: method !== 'get' ? data : undefined
        };
        // console.time(method.toUpperCase())
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$api$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])(config);
        // console.info(`Successfully received data via ${method.toUpperCase()} method requested to ${url}.`)
        // console.clear()
        return res?.data;
    } catch (err) {
        console.error(`Error during the ${method.toUpperCase()} request to ${url} : ${err.status}`);
        if (err.status === 401) localStorage.clear();
        throw err.response;
    } finally{
    // console.trace()
    // console.timeEnd(config)
    }
};
const get = (url)=>request('get', url, {});
const post = (url, data)=>request('post', url, data);
const put = (url, data)=>request('put', url, data);
const patch = (url, data)=>request('patch', url, data);
const destroy = (url)=>request('delete', url, {});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/authSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearUser": (()=>clearUser),
    "default": (()=>__TURBOPACK__default__export__),
    "setUser": (()=>setUser)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false
};
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action)=>{
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        clearUser: (state)=>{
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        }
    }
});
const { setUser, clearUser } = authSlice.actions;
const __TURBOPACK__default__export__ = authSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/utils/AuthContext.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$api$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/api.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/config.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AxiosUtils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/AxiosUtils.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$authSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/authSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/comman/notification/Notification.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$helper$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/helper.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])();
const url = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].reactApiUrl;
const AuthProvider = ({ children })=>{
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useDispatch"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isLoggedIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"])({
        "AuthProvider.useSelector[isLoggedIn]": (state)=>state.auth.isAuthenticated
    }["AuthProvider.useSelector[isLoggedIn]"]);
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"])({
        "AuthProvider.useSelector[user]": (state)=>state.auth.user
    }["AuthProvider.useSelector[user]"]);
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"])({
        "AuthProvider.useSelector": (state)=>state.auth.token
    }["AuthProvider.useSelector"]) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$helper$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getToken"])();
    // const token = localStorage.getItem('token');
    const EXPIRATION_TIME = 60 * 60 * 1000; // 3600000 // 1 hour
    const isTokenExpired = ()=>{
        const expiry_time = localStorage?.getItem('expiry_time');
        return expiry_time ? Date.now() > parseInt(expiry_time, 10) : true;
    };
    const storeUserData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[storeUserData]": async (data, token)=>{
            const expiry_time = Date.now() + EXPIRATION_TIME;
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$authSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["setUser"])({
                user: data,
                token: token
            }));
            localStorage.setItem('expiry_time', expiry_time.toString());
        }
    }["AuthProvider.useCallback[storeUserData]"], [
        dispatch,
        EXPIRATION_TIME
    ]);
    const clearUserData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[clearUserData]": async ()=>{
            await dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$authSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["clearUser"])());
            localStorage.clear();
            console.trace();
            console.info('Logged out... 👋');
        }
    }["AuthProvider.useCallback[clearUserData]"], [
        dispatch
    ]);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[register]": async (name, email, password, phone)=>{
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$api$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post(`${url}/sign-up`, {
                    name,
                    email,
                    password,
                    phone
                });
                return data;
            } catch (error) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__["notifyError"])('Registration error:', error);
                throw error;
            }
        }
    }["AuthProvider.useCallback[register]"], []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (email, password)=>{
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$api$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post(`${url}/sign-in`, {
                    email,
                    password
                });
                await storeUserData(data.user, data?.token);
                localStorage.setItem('token', data?.token);
                localStorage.setItem('user', data?.user);
                localStorage.setItem('role', data?.user?.role?.name);
                localStorage.setItem('user_id', data?.user?._id);
                return data;
            } catch (err) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__["notifyError"])(`Login error: ${err.message}`);
                throw err;
            }
        }
    }["AuthProvider.useCallback[login]"], [
        storeUserData
    ]);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": async ()=>{
            await clearUserData();
        }
    }["AuthProvider.useCallback[logout]"], [
        clearUserData
    ]);
    const deepEqual = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[deepEqual]": (obj1, obj2)=>{
            if (obj1 === obj2) return true;
            if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
                return false;
            }
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) return false;
            for (let key of keys1){
                if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
                    return false;
                }
            }
            return true;
        }
    }["AuthProvider.useCallback[deepEqual]"], []);
    const loadUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[loadUser]": async ()=>{
            if (token && user) {
                try {
                    const { data } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AxiosUtils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["get"])(`/users/${user._id}`, token);
                    if (!deepEqual(data, user)) {
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$authSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["setUser"])({
                            user: data,
                            token: data.token
                        }));
                    }
                } catch (err) {
                    console.error(err.message);
                    logout();
                }
            }
            setLoading(false);
        }
    }["AuthProvider.useCallback[loadUser]"], [
        token,
        user,
        dispatch,
        deepEqual,
        logout
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (isTokenExpired()) {
                console.error(`Token expired!`);
                logout();
            } else {
                loadUser();
            }
        }
    }["AuthProvider.useEffect"], [
        logout,
        loadUser
    ]);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[contextValue]": ()=>({
                user,
                register,
                login,
                logout,
                loadUser,
                isLoggedIn,
                loading
            })
    }["AuthProvider.useMemo[contextValue]"], [
        user,
        register,
        login,
        logout,
        loadUser,
        isLoggedIn,
        loading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: contextValue,
        children: !loading && children
    }, void 0, false, {
        fileName: "[project]/components/utils/AuthContext.js",
        lineNumber: 127,
        columnNumber: 9
    }, this);
};
_s(AuthProvider, "7ZlI+Kf3Do0mrzngrtMR2kf1zY4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"]
    ];
});
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
};
_s1(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/admin/form/SubmitButton.jsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
;
function SubmitButton({ className, name, type = 'submit', disable = false, onClick = null }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: `col-xl-2 col-md-2 col-sm-3 col-xs-4 col-5 btn btn-outline-${className} btn-sm rounded-pill text-capitalize`,
            type: type,
            disable: disable,
            onClick: onClick,
            children: name
        }, void 0, false, {
            fileName: "[project]/components/admin/form/SubmitButton.jsx",
            lineNumber: 6,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_c = SubmitButton;
const __TURBOPACK__default__export__ = SubmitButton;
var _c;
__turbopack_context__.k.register(_c, "SubmitButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/utils/FormValidation.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "aboutProfileValidation": (()=>aboutProfileValidation),
    "aboutUsValidation": (()=>aboutUsValidation),
    "bannerValidation": (()=>bannerValidation),
    "brandValidation": (()=>brandValidation),
    "categoryValidation": (()=>categoryValidation),
    "chatValidation": (()=>chatValidation),
    "colorValidation": (()=>colorValidation),
    "contactValidation": (()=>contactValidation),
    "discountValidation": (()=>discountValidation),
    "faqValidation": (()=>faqValidation),
    "menuValidation": (()=>menuValidation),
    "processApiErrors": (()=>processApiErrors),
    "productValidation": (()=>productValidation),
    "returnPolicyValidation": (()=>returnPolicyValidation),
    "roleValidation": (()=>roleValidation),
    "serviceValidation": (()=>serviceValidation),
    "signInValidation": (()=>signInValidation),
    "signUpValidation": (()=>signUpValidation),
    "socialDetailValidation": (()=>socialDetailValidation),
    "storeValidation": (()=>storeValidation),
    "subCategoryValidation": (()=>subCategoryValidation),
    "supportValidation": (()=>supportValidation),
    "tagValidation": (()=>tagValidation),
    "termsAndConditionsValidation": (()=>termsAndConditionsValidation),
    "unitValidation": (()=>unitValidation),
    "useFormValidation": (()=>useFormValidation),
    "useSignUpFormValidation": (()=>useSignUpFormValidation),
    "useSingInFormValidation": (()=>useSingInFormValidation),
    "userPermissionValidation": (()=>userPermissionValidation),
    "userValidation": (()=>userValidation),
    "validate": (()=>validate),
    "wareHouseValidation": (()=>wareHouseValidation),
    "warrantyValidation": (()=>warrantyValidation)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
;
const useFormValidation = (initialState, validate)=>{
    _s();
    // const { apiErrors } = useContext(SidebarContext);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initialState);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const handleChange = (e)=>{
        const { name, value, type, checked, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        });
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
    // const processedErrors = processApiErrors(apiErrors);
    // setErrors(processedErrors);
    };
    return {
        formData,
        errors,
        handleChange,
        handleSubmit,
        setFormData
    };
};
_s(useFormValidation, "46dUWR8+9N5VnfCWqcTstbjAONA=");
const processApiErrors = (apiErrors)=>{
    const formattedErrors = {};
    apiErrors.forEach((error)=>{
        const { path, msg } = error;
        if (formattedErrors[path]) {
            formattedErrors[path].push(msg);
        } else {
            formattedErrors[path] = [
                msg
            ];
        }
    });
    return formattedErrors;
};
const useSignUpFormValidation = (initialState, validate)=>{
    _s1();
    const [values, setValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initialState);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleChange = (e)=>{
        const { name, value, type, checked } = e.target;
        setValues({
            ...values,
            [name]: value,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        const validationErrors = validate(values);
        setErrors(validationErrors);
        setIsSubmitting(true);
    };
    return {
        values,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    };
};
_s1(useSignUpFormValidation, "l4ofvVF75njIgkseiydC3+PTLuw=");
const useSingInFormValidation = (initialState, validate)=>{
    _s2();
    const [values, setValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initialState);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleChange = (e)=>{
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        });
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        const validationErrors = validate(values);
        setErrors(validationErrors);
        setIsSubmitting(true);
    };
    return {
        values,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    };
};
_s2(useSingInFormValidation, "l4ofvVF75njIgkseiydC3+PTLuw=");
function menuValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter menu name';
    if (!values.route) errors.route = 'Please enter menu route';
    if (!values.icon) errors.icon = 'Please select menu icon';
    return errors;
}
function bannerValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.description) errors.description = 'Please enter description';
    // if (!values.icon) errors.icon = 'Please select icon';
    return errors;
}
function brandValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.description) errors.description = 'Please enter description';
    if (!values.image) errors.image = 'Please upload image';
    return errors;
}
function categoryValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.description) errors.description = 'Please enter description';
    // if (!values.icon) errors.icon = 'Please select icon';
    return errors;
}
function colorValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.hex_code) errors.hex_code = 'Please select hex code';
    return errors;
}
function signUpValidation(values) {
    let errors = {};
    // Name validation
    if (!values.name) errors.name = 'Please enter your name';
    // Email validation
    if (!values.email) {
        errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
    }
    // Password validation
    if (!values.password) {
        errors.password = 'Password is required';
    } else if (values.password.length < 6) {
        errors.password = 'Password needs to be at least 6 characters';
    }
    // Phone validation
    if (!values.phone) {
        errors.phone = 'Phone Number is required';
    } else if (!/^\d{10,}$/.test(values.phone)) {
        errors.phone = 'Phone number must be at least 10 digits and numeric only';
    }
    // Terms and conditions validation
    // if (!values.terms) {
    //     errors.terms = 'You must agree to the terms and conditions';
    // }
    return errors;
}
function contactValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.title) errors.title = 'Please enter title';
    if (!values.description) errors.description = 'Please enter description';
    return errors;
}
function discountValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.percentage) errors.percentage = 'Please enter percentage';
    if (!values.description) errors.description = 'Please enter description';
    return errors;
}
function productValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.description) errors.description = 'Please enter description';
    if (!values.specification) errors.specification = 'Please enter specification';
    if (!values.price) errors.price = 'Please enter price';
    if (!values.quantity) errors.quantity = 'Please enter quantity';
    if (!values.discount_id) errors.discount_id = 'Please select discount';
    if (!values.brand_id) errors.brand_id = 'Please select brand';
    if (!values.tags) errors.tags = 'Please select tags';
    if (!values.categories) errors.categories = 'Please select categories';
    if (!values.image) errors.image = 'Please select image';
    return errors;
}
function chatValidation(values) {
    let errors = {};
    if (!values.receiver_id) errors.receiver_id = 'Please select support agent';
    if (!values.message.trim()) errors.message = 'Please enter your message';
    return errors;
}
function aboutProfileValidation(values) {
    let errors = {};
    if (!values.title) errors.title = 'Please enter title';
    if (!values.bio) errors.bio = 'Please enter bio';
    if (!values.experience) errors.experience = 'Please enter experience';
    return errors;
}
function validate(values) {
    let errors = {};
    return errors;
}
function termsAndConditionsValidation(values) {
    let errors = {};
    if (!values.t_and_c) errors.t_and_c = 'Please enter terms and conditions';
    return errors;
}
function returnPolicyValidation(values) {
    let errors = {};
    if (!values.info) errors.info = 'Please enter return policy info';
    return errors;
}
function aboutUsValidation(values) {
    let errors = {};
    if (!values.info) errors.info = 'Please enter about us info';
    return errors;
}
function roleValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter role name';
    if (!values.permissions) errors.permissions = 'Please select permissions';
    return errors;
}
function serviceValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.description) errors.description = 'Please enter description';
    // if (!values.icon) errors.icon = 'Please select icon';
    return errors;
}
function socialDetailValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.url) errors.url = 'Please enter url';
    // if (!values.icon) errors.icon = 'Please select icon';
    return errors;
}
function signInValidation(values) {
    let errors = {};
    if (!values.email) {
        errors.email = 'Enter your Email';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
    }
    if (!values.password) {
        errors.password = 'Please enter your password';
    } else if (values.password.length < 6) {
        errors.password = 'Password needs to be at least 6 characters';
    }
    return errors;
}
function faqValidation(values) {
    let errors = {};
    if (!values.question) errors.question = 'Please enter question';
    if (!values.answer) errors.answer = 'Please enter answer';
    return errors;
}
function supportValidation(values) {
    let errors = {};
    if (!values.cell) errors.cell = 'Please enter cell number';
    if (values.cell.length < 8) errors.call = 'cell number should to be at least 8 characters';
    if (!/^\d+$/.test(values.cell)) errors.call = 'Cell number must be a valid number';
    if (!values.type) errors.type = 'Please enter type';
    if (!values.email) errors.email = 'Please enter email';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) errors.email = 'Please enter a valid email address';
    if (!values.address) errors.address = 'Please enter address';
    if (values.address.length < 5 || values.address.length > 200) errors.address = 'Address must be between 5 and 200 characters';
    if (!values.hours_start) errors.hours_start = 'Please enter hours start';
    if (!/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/.test(values.hours_start)) errors.hours_start = 'Start hours must be in valid 24-hour format (HH:mm)';
    if (!values.hours_end) errors.hours_end = 'Please enter hours end';
    if (!/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/.test(values.hours_end)) errors.hours_end = 'End hours must be in valid 24-hour format (HH:mm)';
    if (!values.week_start) errors.week_start = 'Please enter week start';
    // if (!/^Week \d+$/.test(values.week_start)) errors.week_start = 'Week start must be in the format "Week X" (e.g., Week 1)';
    if (!values.week_end) errors.week_end = 'Please enter week end';
    // if (!/^Week \d+$/.test(values.week_end)) errors.week_end = 'Week end must be in the format "Week X" (e.g., Week 1)';
    return errors;
}
function storeValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.phone) errors.phone = 'Please enter phone';
    if (values.phone.length < 8) errors.phone = 'Phone number should to be at least 8 characters';
    if (!values.email) errors.email = 'Please enter email';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) errors.email = 'Please enter a valid email address';
    if (!values.address) errors.address = 'Please enter address';
    if (values.address.length < 5 || values.address.length > 200) errors.address = 'Address must be between 5 and 200 characters';
    if (!values.city) errors.city = 'Please enter city';
    if (!values.state) errors.state = 'Please enter state';
    if (!values.zipcode) errors.zipcode = 'Please enter zipcode';
    if (!values.country) errors.country = 'Please enter country';
    if (!values.supplier_id) errors.supplier_id = 'Please select supplier';
    return errors;
}
function subCategoryValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    // if (!values.icon) errors.icon = 'Please select icon';
    if (!values.category) errors.category = 'Please select category';
    if (!values.description) errors.description = 'Please enter description';
    return errors;
}
function userPermissionValidation(values) {
    let errors = {};
    if (!values.user_id) errors.user_id = 'Please select user';
    // if (!values.role_id) errors.role_id = 'Please select role';
    return errors;
}
function userValidation(values) {
    let errors = {};
    if (!values.first_name) errors.first_name = 'Please enter first name';
    if (values.first_name.length < 3) errors.first_name = 'First name needs to be at least 3 characters';
    if (!values.last_name) errors.last_name = 'Please enter last name';
    if (values.last_name.length < 3) errors.last_name = 'Last name needs to be at least 3 characters';
    if (!values.email) errors.email = 'Please enter email';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) errors.email = 'Please enter a valid email address';
    if (!values.password) errors.password = 'Please enter password';
    if (values.password.length < 8) errors.password = 'Password needs to be at least 8 characters';
    if (!values.phone) errors.phone = 'Please enter phone';
    if (values.phone.length < 8) errors.phone = 'Phone number should to be at least 8 characters';
    if (!values.role_id) errors.role_id = 'Please select role';
    return errors;
}
function tagValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    return errors;
}
function unitValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.short_name) errors.short_name = 'Please enter short name';
    return errors;
}
function wareHouseValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.percentage) errors.percentage = 'Please enter percentage';
    if (!values.description) errors.description = 'Please enter description';
    return errors;
}
function warrantyValidation(values) {
    let errors = {};
    if (!values.name) errors.name = 'Please enter name';
    if (!values.duration) errors.duration = 'Please select duration';
    if (!values.period) errors.period = 'Please select period';
    if (!values.description) errors.description = 'Please enter description';
    return errors;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/pages/auth/sign-in/SignInForm.jsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "SignInForm": (()=>SignInForm)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AuthContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/AuthContext.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$form$2f$SubmitButton$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/form/SubmitButton.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/comman/notification/Notification.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$FormValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/FormValidation.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
const SignInForm = ()=>{
    _s();
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"])({
        "SignInForm.useSelector[token]": (state)=>state.auth.token
    }["SignInForm.useSelector[token]"]);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { login } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AuthContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isPending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTransition"])();
    const initialState = {
        email: '',
        password: ''
    };
    const { values, errors, handleChange, handleSubmit: validateSubmit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$FormValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useSingInFormValidation"])(initialState, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$FormValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["signInValidation"]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        validateSubmit(e);
        if (errors && Object.keys(errors).length !== 0) {
            // console.table(errors);
            return false;
        }
        startTransition(async ()=>{
            try {
                const response = await login(values.email, values.password);
                if (!response) throw new Error("Failed to submit form");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$comman$2f$notification$2f$Notification$2e$js__$5b$client$5d$__$28$ecmascript$29$__["notifySuccess"])(response.message);
                router.push('/admin/index');
            } catch (error) {
                console.error(`Error during login: ${error}`);
            }
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SignInForm.useEffect": ()=>{
            router.push(token ? '/auth' : '/auth/sign-in');
        }
    }["SignInForm.useEffect"], [
        token,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            encType: `multipart/form-data`,
            className: `row mt-3 g-3 needs-validation`,
            onSubmit: handleSubmit,
            noValidate: true,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `col-12`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: `yourUsername`,
                            className: `form-label`,
                            children: "User Email"
                        }, void 0, false, {
                            fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                            lineNumber: 53,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `input-group has-validation`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `input-group-text`,
                                    id: `inputGroupPrepend`,
                                    children: " @ "
                                }, void 0, false, {
                                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                                    lineNumber: 55,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: `email`,
                                    name: `email`,
                                    className: `form-control`,
                                    id: "yourUsername",
                                    value: values.email,
                                    onChange: handleChange,
                                    autoComplete: "off"
                                }, void 0, false, {
                                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                                    lineNumber: 56,
                                    columnNumber: 25
                                }, this),
                                errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `invalid-feedback d-block`,
                                    children: errors.email
                                }, void 0, false, {
                                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                                    lineNumber: 65,
                                    columnNumber: 42
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                            lineNumber: 54,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                    lineNumber: 52,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `col-12`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: `yourPassword`,
                            className: `form-label`,
                            children: "password"
                        }, void 0, false, {
                            fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                            lineNumber: 70,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: `password`,
                            name: `password`,
                            className: `form-control`,
                            id: "yourPassword",
                            value: values.password,
                            onChange: handleChange,
                            autoComplete: "off"
                        }, void 0, false, {
                            fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                            lineNumber: 71,
                            columnNumber: 21
                        }, this),
                        errors.password && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `invalid-feedback d-block`,
                            children: errors.password
                        }, void 0, false, {
                            fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                            lineNumber: 80,
                            columnNumber: 41
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                    lineNumber: 69,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `col-12`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$form$2f$SubmitButton$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        className: `custom w-50`,
                        disable: isPending,
                        name: isPending ? 'Login...' : 'Login'
                    }, void 0, false, {
                        fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                        lineNumber: 84,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                    lineNumber: 83,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `col-12`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `small mb-0`,
                        children: [
                            "Don't have account? ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/auth/sign-up`,
                                children: "Sign Up"
                            }, void 0, false, {
                                fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                                lineNumber: 87,
                                columnNumber: 69
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                        lineNumber: 87,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
                    lineNumber: 86,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/auth/sign-in/SignInForm.jsx",
            lineNumber: 51,
            columnNumber: 13
        }, this)
    }, void 0, false);
};
_s(SignInForm, "rB3/ECDizAcX76XIqGAb0WgrILg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useSelector"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AuthContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useTransition"],
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$FormValidation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useSingInFormValidation"]
    ];
});
_c = SignInForm;
var _c;
__turbopack_context__.k.register(_c, "SignInForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/pages/auth/sign-in/SignIn.jsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$footer$2f$designedby$2f$Designedby$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/footer/designedby/Designedby.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$auth$2f$sign$2d$in$2f$SignInForm$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/pages/auth/sign-in/SignInForm.jsx [client] (ecmascript)");
;
;
;
;
;
function SignIn() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `container`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: `section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `container`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `row justify-content-center`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `col-lg-5 col-md-7 d-flex flex-column align-items-center justify-content-center`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `d-flex justify-content-center py-4`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `#`,
                                        className: `logo d-flex align-items-center w-auto`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `d-none d-lg-block`,
                                            children: "Admin"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                            lineNumber: 16,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                        lineNumber: 15,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                    lineNumber: 14,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `card mb-3`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `card-body`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `pt-4 pb-2`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                    className: `card-title text-center pb-0 fs-4`,
                                                    children: "Login to Your Account"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                                    lineNumber: 22,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                                lineNumber: 21,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$auth$2f$sign$2d$in$2f$SignInForm$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["SignInForm"], {}, void 0, false, {
                                                fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                                lineNumber: 24,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                        lineNumber: 20,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                    lineNumber: 19,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$footer$2f$designedby$2f$Designedby$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                                    lineNumber: 27,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                            lineNumber: 13,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                        lineNumber: 12,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                    lineNumber: 11,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
                lineNumber: 10,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/auth/sign-in/SignIn.jsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_c = SignIn;
const __TURBOPACK__default__export__ = SignIn;
var _c;
__turbopack_context__.k.register(_c, "SignIn");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/pages/auth/sign-in/index.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Page)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$auth$2f$sign$2d$in$2f$SignIn$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/pages/auth/sign-in/SignIn.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [client] (ecmascript)");
;
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: "Sign In"
                    }, void 0, false, {
                        fileName: "[project]/pages/auth/sign-in/index.tsx",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Next app sign in page"
                    }, void 0, false, {
                        fileName: "[project]/pages/auth/sign-in/index.tsx",
                        lineNumber: 10,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1"
                    }, void 0, false, {
                        fileName: "[project]/pages/auth/sign-in/index.tsx",
                        lineNumber: 11,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "[project]/pages/auth/sign-in/index.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/auth/sign-in/index.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$auth$2f$sign$2d$in$2f$SignIn$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/auth/sign-in/index.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/auth/sign-in/index.tsx [client] (ecmascript)\" } [client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const PAGE_PATH = "/auth/sign-up/SignUp";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/auth/sign-in/index.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}}),
"[project]/pages/auth/sign-in/index.tsx (hmr-entry)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, m: module } = __turbopack_context__;
{
__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/auth/sign-in/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__7fbe6e36._.js.map