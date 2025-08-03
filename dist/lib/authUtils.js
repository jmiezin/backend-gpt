"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveUserId = void 0;
function getEffectiveUserId(req) {
    const isAdmin = req.auth?.roles?.includes("admin");
    const sub = req.auth?.sub;
    const override = req.query.asUser;
    if (isAdmin && typeof override === "string" && override.trim() !== "") {
        return override.trim();
    }
    return sub;
}
exports.getEffectiveUserId = getEffectiveUserId;
