"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/layout",{

/***/ "(app-pages-browser)/./app/globals.css":
/*!*************************!*\
  !*** ./app/globals.css ***!
  \*************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"e9f7865ab547\");\nif (true) { module.hot.accept() }\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9nbG9iYWxzLmNzcyIsIm1hcHBpbmdzIjoiO0FBQUEsK0RBQWUsY0FBYztBQUM3QixJQUFJLElBQVUsSUFBSSxpQkFBaUIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vYXBwL2dsb2JhbHMuY3NzP2ZhYTciXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJlOWY3ODY1YWI1NDdcIlxuaWYgKG1vZHVsZS5ob3QpIHsgbW9kdWxlLmhvdC5hY2NlcHQoKSB9XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/globals.css\n"));

/***/ }),

/***/ "(app-pages-browser)/./components/ClientLayout.tsx":
/*!*************************************!*\
  !*** ./components/ClientLayout.tsx ***!
  \*************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ ClientLayout; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(app-pages-browser)/./lib/auth.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \n\nfunction ClientLayout(param) {\n    let { children } = param;\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.AuthProvider, {\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/christienskousen/Desktop/repos/slack2/client/components/ClientLayout.tsx\",\n        lineNumber: 11,\n        columnNumber: 5\n    }, this);\n}\n_c = ClientLayout;\nvar _c;\n$RefreshReg$(_c, \"ClientLayout\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2NvbXBvbmVudHMvQ2xpZW50TGF5b3V0LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRTBDO0FBTTNCLFNBQVNDLGFBQWEsS0FBK0I7UUFBL0IsRUFBRUMsUUFBUSxFQUFxQixHQUEvQjtJQUNuQyxxQkFDRSw4REFBQ0YsbURBQVlBO2tCQUNWRTs7Ozs7O0FBR1A7S0FOd0JEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2NvbXBvbmVudHMvQ2xpZW50TGF5b3V0LnRzeD9kN2ExIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50JztcblxuaW1wb3J0IHsgQXV0aFByb3ZpZGVyIH0gZnJvbSAnQC9saWIvYXV0aCc7XG5cbmludGVyZmFjZSBDbGllbnRMYXlvdXRQcm9wcyB7XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENsaWVudExheW91dCh7IGNoaWxkcmVuIH06IENsaWVudExheW91dFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPEF1dGhQcm92aWRlcj5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0F1dGhQcm92aWRlcj5cbiAgKTtcbn0gIl0sIm5hbWVzIjpbIkF1dGhQcm92aWRlciIsIkNsaWVudExheW91dCIsImNoaWxkcmVuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./components/ClientLayout.tsx\n"));

/***/ }),

/***/ "(app-pages-browser)/./lib/auth.tsx":
/*!**********************!*\
  !*** ./lib/auth.tsx ***!
  \**********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: function() { return /* binding */ AuthProvider; },\n/* harmony export */   useAuth: function() { return /* binding */ useAuth; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* __next_internal_client_entry_do_not_use__ useAuth,AuthProvider auto */ \nvar _s = $RefreshSig$(), _s1 = $RefreshSig$();\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n    user: null,\n    isLoading: true,\n    login: async ()=>{\n        throw new Error(\"Not implemented\");\n    },\n    register: async ()=>{\n        throw new Error(\"Not implemented\");\n    },\n    logout: ()=>{}\n});\nconst useAuth = ()=>{\n    _s();\n    return (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n};\n_s(useAuth, \"gDsCjeeItUuvgOWf1v4qoK9RF6k=\");\nfunction AuthProvider(param) {\n    let { children } = param;\n    _s1();\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    // Check for existing token and validate it\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const token = localStorage.getItem(\"token\");\n        if (token) {\n            fetch(\"\".concat(\"http://localhost:4000\", \"/api/auth/validate\"), {\n                headers: {\n                    Authorization: \"Bearer \".concat(token)\n                }\n            }).then((res)=>{\n                if (res.ok) return res.json();\n                throw new Error(\"Invalid token\");\n            }).then((data)=>{\n                setUser(data.user);\n            }).catch(()=>{\n                localStorage.removeItem(\"token\");\n            }).finally(()=>{\n                setIsLoading(false);\n            });\n        } else {\n            setIsLoading(false);\n        }\n    }, []);\n    const login = async (email, password)=>{\n        const res = await fetch(\"\".concat(\"http://localhost:4000\", \"/api/auth/login\"), {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                email,\n                password\n            })\n        });\n        if (!res.ok) {\n            const error = await res.json();\n            throw new Error(error.error || \"Failed to login\");\n        }\n        const data = await res.json();\n        localStorage.setItem(\"token\", data.token);\n        setUser(data.user);\n        return data.user;\n    };\n    const register = async (email, password, name)=>{\n        const res = await fetch(\"\".concat(\"http://localhost:4000\", \"/api/auth/register\"), {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                email,\n                password,\n                name\n            })\n        });\n        if (!res.ok) {\n            const error = await res.json();\n            throw new Error(error.error || \"Failed to register\");\n        }\n        const data = await res.json();\n        localStorage.setItem(\"token\", data.token);\n        setUser(data.user);\n        return data.user;\n    };\n    const logout = ()=>{\n        localStorage.removeItem(\"token\");\n        setUser(null);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            isLoading,\n            login,\n            register,\n            logout\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/christienskousen/Desktop/repos/slack2/client/lib/auth.tsx\",\n        lineNumber: 114,\n        columnNumber: 5\n    }, this);\n}\n_s1(AuthProvider, \"YajQB7LURzRD+QP5gw0+K2TZIWA=\");\n_c = AuthProvider;\nvar _c;\n$RefreshReg$(_c, \"AuthProvider\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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UUFBUTtJQUNWO0lBRUEscUJBQ0UsOERBQUNWLFlBQVlzQyxRQUFRO1FBQUNDLE9BQU87WUFBRXRDO1lBQU1DO1lBQVdDO1lBQU9FO1lBQVVDO1FBQU87a0JBQ3JFRzs7Ozs7O0FBR1A7SUFqRmdCRDtLQUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9saWIvYXV0aC50c3g/ZjU0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuXG5pbnRlcmZhY2UgVXNlciB7XG4gIGlkOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEF1dGhDb250ZXh0VHlwZSB7XG4gIHVzZXI6IFVzZXIgfCBudWxsO1xuICBpc0xvYWRpbmc6IGJvb2xlYW47XG4gIGxvZ2luOiAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4gUHJvbWlzZTxVc2VyPjtcbiAgcmVnaXN0ZXI6IChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpID0+IFByb21pc2U8VXNlcj47XG4gIGxvZ291dDogKCkgPT4gdm9pZDtcbn1cblxuY29uc3QgQXV0aENvbnRleHQgPSBjcmVhdGVDb250ZXh0PEF1dGhDb250ZXh0VHlwZT4oe1xuICB1c2VyOiBudWxsLFxuICBpc0xvYWRpbmc6IHRydWUsXG4gIGxvZ2luOiBhc3luYyAoKSA9PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfSxcbiAgcmVnaXN0ZXI6IGFzeW5jICgpID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9LFxuICBsb2dvdXQ6ICgpID0+IHt9LFxufSk7XG5cbmV4cG9ydCBjb25zdCB1c2VBdXRoID0gKCkgPT4gdXNlQ29udGV4dChBdXRoQ29udGV4dCk7XG5cbmludGVyZmFjZSBBdXRoUHJvdmlkZXJQcm9wcyB7XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBdXRoUHJvdmlkZXIoeyBjaGlsZHJlbiB9OiBBdXRoUHJvdmlkZXJQcm9wcykge1xuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZTxVc2VyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICAvLyBDaGVjayBmb3IgZXhpc3RpbmcgdG9rZW4gYW5kIHZhbGlkYXRlIGl0XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKTtcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIGZldGNoKGAke3Byb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0FQSV9VUkx9L2FwaS9hdXRoL3ZhbGlkYXRlYCwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcy5vaykgcmV0dXJuIHJlcy5qc29uKCk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRva2VuJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgc2V0VXNlcihkYXRhLnVzZXIpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xuICAgICAgICB9KVxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbXSk7XG5cbiAgY29uc3QgbG9naW4gPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8VXNlcj4gPT4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke3Byb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0FQSV9VUkx9L2FwaS9hdXRoL2xvZ2luYCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBlbWFpbCwgcGFzc3dvcmQgfSksXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLmVycm9yIHx8ICdGYWlsZWQgdG8gbG9naW4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCBkYXRhLnRva2VuKTtcbiAgICBzZXRVc2VyKGRhdGEudXNlcik7XG4gICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgfTtcblxuICBjb25zdCByZWdpc3RlciA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFVzZXI+ID0+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUElfVVJMfS9hcGkvYXV0aC9yZWdpc3RlcmAsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZW1haWwsIHBhc3N3b3JkLCBuYW1lIH0pLFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5lcnJvciB8fCAnRmFpbGVkIHRvIHJlZ2lzdGVyJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgZGF0YS50b2tlbik7XG4gICAgc2V0VXNlcihkYXRhLnVzZXIpO1xuICAgIHJldHVybiBkYXRhLnVzZXI7XG4gIH07XG5cbiAgY29uc3QgbG9nb3V0ID0gKCkgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xuICAgIHNldFVzZXIobnVsbCk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgaXNMb2FkaW5nLCBsb2dpbiwgcmVnaXN0ZXIsIGxvZ291dCB9fT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0F1dGhDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufSAiXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwiQXV0aENvbnRleHQiLCJ1c2VyIiwiaXNMb2FkaW5nIiwibG9naW4iLCJFcnJvciIsInJlZ2lzdGVyIiwibG9nb3V0IiwidXNlQXV0aCIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwic2V0VXNlciIsInNldElzTG9hZGluZyIsInRva2VuIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImZldGNoIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX0FQSV9VUkwiLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsInRoZW4iLCJyZXMiLCJvayIsImpzb24iLCJkYXRhIiwiY2F0Y2giLCJyZW1vdmVJdGVtIiwiZmluYWxseSIsImVtYWlsIiwicGFzc3dvcmQiLCJtZXRob2QiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsImVycm9yIiwic2V0SXRlbSIsIm5hbWUiLCJQcm92aWRlciIsInZhbHVlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./lib/auth.tsx\n"));

/***/ })

});