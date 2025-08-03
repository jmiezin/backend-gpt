"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = void 0;
function getUserId(req) {
    const auth = req.auth;
    if (!auth || (!auth.userId && !auth.oid)) {
        throw new Error("Non autorisé : userId manquant dans le token");
    }
    return auth.userId || auth.oid;
}
exports.getUserId = getUserId;
