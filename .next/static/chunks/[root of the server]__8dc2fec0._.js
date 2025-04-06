(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/[root of the server]__8dc2fec0._.js", {

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
"[project]/components/config.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
const config = {
    baseUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.BASE_URL,
    reactUrl: `${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.BASE_URL}:${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.REACT_PORT}`,
    reactApiUrl: `http://192.168.189.53:5080/api`,
    pageignation: `${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.DATA_PAGINATION_LIMIT}`
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
const getToken = (string)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return localStorage.getItem(string);
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
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$helper$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getToken"])('token');
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
    }["AuthProvider.useSelector"]) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$helper$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getToken"])('token');
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
            console.log(email, password, url);
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
        lineNumber: 128,
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
"[project]/components/context/ReRenderContext.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ReRenderProvider": (()=>ReRenderProvider),
    "useReRender": (()=>useReRender)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const ReRenderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])();
const ReRenderProvider = ({ children })=>{
    _s();
    const [renderKey, setRenderKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const triggerReRender = ()=>{
        setRenderKey((prevKey)=>prevKey + 1);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReRenderContext.Provider, {
        value: {
            renderKey,
            triggerReRender
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/context/ReRenderContext.js",
        lineNumber: 13,
        columnNumber: 5
    }, this);
};
_s(ReRenderProvider, "CUJz0/JyGQjG6dqQKfL5BQHKPOw=");
_c = ReRenderProvider;
const useReRender = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(ReRenderContext);
};
_s1(useReRender, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "ReRenderProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/actions.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "FETCH_DATA_FAILURE": (()=>FETCH_DATA_FAILURE),
    "FETCH_DATA_SUCCESS": (()=>FETCH_DATA_SUCCESS),
    "fetchData": (()=>fetchData)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [client] (ecmascript)");
;
const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';
const FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE';
const fetchData = (url)=>{
    return async (dispatch)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].get(url);
            dispatch({
                type: FETCH_DATA_SUCCESS,
                payload: response.data
            });
        } catch (error) {
            dispatch({
                type: FETCH_DATA_FAILURE,
                payload: error.message
            });
        }
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/reducer.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$actions$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/actions.js [client] (ecmascript)");
;
const initialState = {
    data: [],
    loading: true,
    error: null
};
const dataReducer = (state = initialState, action)=>{
    switch(action.type){
        case __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$actions$2e$js__$5b$client$5d$__$28$ecmascript$29$__["FETCH_DATA_SUCCESS"]:
            return {
                ...state,
                data: action.payload,
                loading: false
            };
        case __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$actions$2e$js__$5b$client$5d$__$28$ecmascript$29$__["FETCH_DATA_FAILURE"]:
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        default:
            return state;
    }
};
const __TURBOPACK__default__export__ = dataReducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/MenuRedux/menuActions.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "SET_MENU_DATA": (()=>SET_MENU_DATA),
    "setMenuData": (()=>setMenuData),
    "setMenuFilterData": (()=>setMenuFilterData)
});
const SET_MENU_DATA = 'SET_MENU_DATA';
const setMenuData = (data)=>({
        type: SET_MENU_DATA,
        payload: data
    });
const setMenuFilterData = (data)=>({
        type: SET_MENU_DATA,
        payload: data
    });
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/MenuRedux/menuReducer.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$MenuRedux$2f$menuActions$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/MenuRedux/menuActions.js [client] (ecmascript)");
;
const initialState = {
    menuData: []
};
const menuReducer = (state = initialState, action)=>{
    switch(action.type){
        case __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$MenuRedux$2f$menuActions$2e$js__$5b$client$5d$__$28$ecmascript$29$__["SET_MENU_DATA"]:
            return {
                ...state,
                menuData: action.payload
            };
        default:
            return state;
    }
};
const __TURBOPACK__default__export__ = menuReducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/permissionSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearPermission": (()=>clearPermission),
    "default": (()=>__TURBOPACK__default__export__),
    "setPermission": (()=>setPermission)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    permission: null
};
const permissionSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'permission',
    initialState,
    reducers: {
        setPermission: (state, action)=>{
            state.permission = action.payload.permission;
        },
        clearPermission: (state)=>{
            state.permission = null;
        }
    }
});
const { setPermission, clearPermission } = permissionSlice.actions;
const __TURBOPACK__default__export__ = permissionSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/sideBarSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSideBar": (()=>clearSideBar),
    "default": (()=>__TURBOPACK__default__export__),
    "setSideBar": (()=>setSideBar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    sideBar: null
};
const sideBarSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'sideBar',
    initialState,
    reducers: {
        setSideBar: (state, action)=>{
            state.sideBar = action.payload.sideBar;
        },
        clearSideBar: (state)=>{
            state.sideBar = null;
        }
    }
});
const { setSideBar, clearSideBar } = sideBarSlice.actions;
const __TURBOPACK__default__export__ = sideBarSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/roleTableSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearRoleTable": (()=>clearRoleTable),
    "default": (()=>__TURBOPACK__default__export__),
    "setRoleTable": (()=>setRoleTable)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    roleTable: null
};
const roleTableSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'roleTable',
    initialState,
    reducers: {
        setRoleTable: (state, action)=>{
            state.roleTable = action.payload.roleTable;
        },
        clearRoleTable: (state)=>{
            state.roleTable = null;
        }
    }
});
const { setRoleTable, clearRoleTable } = roleTableSlice.actions;
const __TURBOPACK__default__export__ = roleTableSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/iconSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearIcon": (()=>clearIcon),
    "default": (()=>__TURBOPACK__default__export__),
    "setIcon": (()=>setIcon)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    iconData: null
};
const iconSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'icon',
    initialState,
    reducers: {
        setIcon: (state, action)=>{
            state.iconData = action.payload.icon;
        },
        clearIcon: (state)=>{
            state.iconData = null;
        }
    }
});
const { setIcon, clearIcon } = iconSlice.actions;
const __TURBOPACK__default__export__ = iconSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/roleSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearRole": (()=>clearRole),
    "default": (()=>__TURBOPACK__default__export__),
    "setRole": (()=>setRole)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    role: null
};
const roleSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'role',
    initialState,
    reducers: {
        setRole: (state, action)=>{
            state.role = action.payload.role;
        },
        clearRole: (state)=>{
            state.role = null;
        }
    }
});
const { setRole, clearRole } = roleSlice.actions;
const __TURBOPACK__default__export__ = roleSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/alertSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "addAlert": (()=>addAlert),
    "clearAlert": (()=>clearAlert),
    "default": (()=>__TURBOPACK__default__export__),
    "removeAlert": (()=>removeAlert),
    "setAlerts": (()=>setAlerts)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    notifications: []
};
const alertSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'alert',
    initialState,
    reducers: {
        setAlerts: (state, action)=>{
            state.notifications = action.payload;
        },
        addAlert: (state, action)=>{
            state.notifications.push(action.payload);
        },
        removeAlert: (state, action)=>{
            state.notifications.splice(action.payload, 1);
        },
        clearAlert: (state, action)=>{
            const index = action.payload;
            if (index === undefined) {
                state.notifications = [];
            } else {
                state.notifications.splice(index, 1);
            }
        }
    }
});
const { setAlerts, addAlert, clearAlert, removeAlert } = alertSlice.actions;
const __TURBOPACK__default__export__ = alertSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/activeMenuSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearActiveMenu": (()=>clearActiveMenu),
    "default": (()=>__TURBOPACK__default__export__),
    "setActiveMenu": (()=>setActiveMenu)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    activeMenu: null
};
const activeMenuSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'activeMenu',
    initialState,
    reducers: {
        setActiveMenu: (state, action)=>{
            state.activeMenu = action.payload;
        },
        clearActiveMenu: (state)=>{
            state.activeMenu = null;
        }
    }
});
const { setActiveMenu, clearActiveMenu } = activeMenuSlice.actions;
const __TURBOPACK__default__export__ = activeMenuSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/activeSubMenuSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearActiveSubMenu": (()=>clearActiveSubMenu),
    "default": (()=>__TURBOPACK__default__export__),
    "setActiveSubMenu": (()=>setActiveSubMenu)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    activeSubMenu: null
};
const activeSubMenuSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'activeSubMenu',
    initialState,
    reducers: {
        setActiveSubMenu: (state, action)=>{
            state.activeSubMenu = action.payload.activeSubMenu;
        },
        clearActiveSubMenu: (state)=>{
            state.activeSubMenu = null;
        }
    }
});
const { setActiveSubMenu, clearActiveSubMenu } = activeSubMenuSlice.actions;
const __TURBOPACK__default__export__ = activeSubMenuSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/userSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectUser": (()=>clearSelectUser),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectUser": (()=>setSelectUser)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectUserData: null
};
const selectUserSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectUser',
    initialState,
    reducers: {
        setSelectUser: (state, action)=>{
            state.selectUserData = action.payload.selectUser;
        },
        clearSelectUser: (state)=>{
            state.selectUserData = null;
        }
    }
});
const { setSelectUser, clearSelectUser } = selectUserSlice.actions;
const __TURBOPACK__default__export__ = selectUserSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/roleSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectRole": (()=>clearSelectRole),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectRole": (()=>setSelectRole)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectRoleData: null
};
const selectRoleSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectRole',
    initialState,
    reducers: {
        setSelectRole: (state, action)=>{
            state.selectRoleData = action.payload.selectRole;
        },
        clearSelectRole: (state)=>{
            state.selectRoleData = null;
        }
    }
});
const { setSelectRole, clearSelectRole } = selectRoleSlice.actions;
const __TURBOPACK__default__export__ = selectRoleSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/categorySlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectCategory": (()=>clearSelectCategory),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectCategory": (()=>setSelectCategory)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectCategoryData: null
};
const selectCategorySlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectCategory',
    initialState,
    reducers: {
        setSelectCategory: (state, action)=>{
            state.selectCategoryData = action.payload.selectCategory;
        },
        clearSelectCategory: (state)=>{
            state.selectCategoryData = null;
        }
    }
});
const { setSelectCategory, clearSelectCategory } = selectCategorySlice.actions;
const __TURBOPACK__default__export__ = selectCategorySlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/bannerSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectBanner": (()=>clearSelectBanner),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectBanner": (()=>setSelectBanner)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectBannerData: null
};
const selectBannerSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectBanner',
    initialState,
    reducers: {
        setSelectBanner: (state, action)=>{
            state.selectBannerData = action.payload.selectBanner;
        },
        clearSelectBanner: (state)=>{
            state.selectBannerData = null;
        }
    }
});
const { setSelectBanner, clearSelectBanner } = selectBannerSlice.actions;
const __TURBOPACK__default__export__ = selectBannerSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/brandSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectBrand": (()=>clearSelectBrand),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectBrand": (()=>setSelectBrand)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectBrandData: null
};
const selectBrandSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectBrand',
    initialState,
    reducers: {
        setSelectBrand: (state, action)=>{
            state.selectBrandData = action.payload.selectBrand;
        },
        clearSelectBrand: (state)=>{
            state.selectBrandData = null;
        }
    }
});
const { setSelectBrand, clearSelectBrand } = selectBrandSlice.actions;
const __TURBOPACK__default__export__ = selectBrandSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/colorSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectColor": (()=>clearSelectColor),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectColor": (()=>setSelectColor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectColorData: null
};
const selectColorSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectColor',
    initialState,
    reducers: {
        setSelectColor: (state, action)=>{
            state.selectColorData = action.payload.selectColor;
        },
        clearSelectColor: (state)=>{
            state.selectColorData = null;
        }
    }
});
const { setSelectColor, clearSelectColor } = selectColorSlice.actions;
const __TURBOPACK__default__export__ = selectColorSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/discountSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectDiscount": (()=>clearSelectDiscount),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectDiscount": (()=>setSelectDiscount)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectDiscountData: null
};
const selectDiscountSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectDiscount',
    initialState,
    reducers: {
        setSelectDiscount: (state, action)=>{
            state.selectDiscountData = action.payload.selectDiscount;
        },
        clearSelectDiscount: (state)=>{
            state.selectDiscountData = null;
        }
    }
});
const { setSelectDiscount, clearSelectDiscount } = selectDiscountSlice.actions;
const __TURBOPACK__default__export__ = selectDiscountSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/subCategorySlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectSubCategory": (()=>clearSelectSubCategory),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectSubCategory": (()=>setSelectSubCategory)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectSubCategoryData: null
};
const selectSubCategorySlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectSubCategory',
    initialState,
    reducers: {
        setSelectSubCategory: (state, action)=>{
            state.selectSubCategoryData = action.payload.selectSubCategory;
        },
        clearSelectSubCategory: (state)=>{
            state.selectSubCategoryData = null;
        }
    }
});
const { setSelectSubCategory, clearSelectSubCategory } = selectSubCategorySlice.actions;
const __TURBOPACK__default__export__ = selectSubCategorySlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/Select/tagSlice.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearSelectTag": (()=>clearSelectTag),
    "default": (()=>__TURBOPACK__default__export__),
    "setSelectTag": (()=>setSelectTag)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [client] (ecmascript) <locals>");
;
const initialState = {
    selectTagData: null
};
const selectTagSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'selectTag',
    initialState,
    reducers: {
        setSelectTag: (state, action)=>{
            state.selectTagData = action.payload.selectTag;
        },
        clearSelectTag: (state)=>{
            state.selectTagData = null;
        }
    }
});
const { setSelectTag, clearSelectTag } = selectTagSlice.actions;
const __TURBOPACK__default__export__ = selectTagSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/store/store.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/redux/dist/redux.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2d$thunk$2f$dist$2f$redux$2d$thunk$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/redux-thunk/dist/redux-thunk.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$reducer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/reducer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$MenuRedux$2f$menuReducer$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/MenuRedux/menuReducer.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$authSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/authSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$permissionSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/permissionSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$sideBarSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/sideBarSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$roleTableSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/roleTableSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$iconSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/iconSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$roleSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/roleSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$alertSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/alertSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$activeMenuSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/activeMenuSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$activeSubMenuSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/activeSubMenuSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$userSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/userSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$roleSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/roleSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$categorySlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/categorySlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$bannerSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/bannerSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$brandSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/brandSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$colorSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/colorSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$discountSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/discountSlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$subCategorySlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/subCategorySlice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$tagSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/Select/tagSlice.js [client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const rootReducer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["combineReducers"])({
    menu: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$MenuRedux$2f$menuReducer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    auth: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$authSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    data: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$reducer$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    permission: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$permissionSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    sideBar: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$sideBarSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    roleTable: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$roleTableSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$iconSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    role: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$roleSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    alert: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$alertSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    active_menu: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$activeMenuSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    active_sub_menu: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$activeSubMenuSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectUser: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$userSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectRole: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$roleSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectCategory: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$categorySlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectBanner: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$bannerSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectBrand: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$brandSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectColor: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$colorSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectDiscount: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$discountSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectSubCategory: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$subCategorySlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
    selectTag: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$Select$2f$tagSlice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"]
});
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["createStore"])(rootReducer, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["applyMiddleware"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2d$thunk$2f$dist$2f$redux$2d$thunk$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["thunk"]));
const __TURBOPACK__default__export__ = store;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/pages/_app.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>App)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AuthContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/utils/AuthContext.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$context$2f$ReRenderContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/context/ReRenderContext.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$store$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/store/store.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [client] (ecmascript)");
;
;
;
;
;
;
function App({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
                        rel: "stylesheet"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                        src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Provider"], {
                store: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$store$2f$store$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$utils$2f$AuthContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$context$2f$ReRenderContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__["ReRenderProvider"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
                            ...pageProps
                        }, void 0, false, {
                            fileName: "[project]/pages/_app.tsx",
                            lineNumber: 18,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 17,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/_app.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = App;
var _c;
__turbopack_context__.k.register(_c, "App");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const PAGE_PATH = "/_app";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/_app.tsx [client] (ecmascript)");
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
"[project]/pages/_app (hmr-entry)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, m: module } = __turbopack_context__;
{
__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__8dc2fec0._.js.map