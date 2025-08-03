"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const PROJECT_ROOT = path_1.default.resolve(__dirname, "../.."); // Deux niveaux au-dessus
router.get("/", (_req, res) => {
    const depth = 3;
    const result = {};
    function scan(dir, currentDepth = 0) {
        if (currentDepth > depth)
            return;
        const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        entries.forEach((entry) => {
            const fullPath = path_1.default.join(dir, entry.name);
            const relPath = path_1.default.relative(PROJECT_ROOT, fullPath);
            if (!result[currentDepth])
                result[currentDepth] = [];
            result[currentDepth].push(relPath);
            if (entry.isDirectory())
                scan(fullPath, currentDepth + 1);
        });
    }
    scan(PROJECT_ROOT);
    res.json({ structure: result });
});
exports.default = router;
