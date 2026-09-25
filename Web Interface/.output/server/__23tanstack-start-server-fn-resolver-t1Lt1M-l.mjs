//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-t1Lt1M-l.js
var manifest = { "a0c9dbc61f8a4c3dc10b9bf882aadbab4f1f5bf304ad8ba31c7a5c0c5c1bf8a7": {
	functionName: "predictYield_createServerFn_handler",
	importer: () => import("./_ssr/predict.functions-Dbfnv_X6.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
