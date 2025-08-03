"use strict";
// 📄 backe../src/lib/permissions.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePermissions = exports.RolePermissions = void 0;
// 🧩 Liste des permissions par rôle (nom d'origine avec underscores)
exports.RolePermissions = {
    Administrator: ["projects.read", "projects.write", "users.read", "users.impersonate", "chat.access"],
    Direction_ADV: ["projects.read"],
    Direction_Applicatif: ["projects.read", "chat.access"],
    Direction_commerciale: ["projects.read"],
    Direction_générale: ["projects.read", "users.read"],
    Direction_Logistique: ["projects.read"],
    Direction_Marketing: ["projects.read", "chat.access"],
    IA_1: ["chat.access"],
    Responsable_ADV: ["projects.read"],
    Responsable_Marketing: ["projects.read", "chat.access"],
    Sales_1: ["chat.access"],
    Sales_2: ["chat.access"],
};
// ✅ Fonction qui retourne une liste unique de permissions pour un ensemble de rôles
function computePermissions(roles) {
    const set = new Set();
    for (const role of roles) {
        const normalized = role.replace(/\s/g, "_");
        const perms = exports.RolePermissions[normalized];
        if (perms) {
            for (const p of perms) {
                set.add(p);
            }
        }
    }
    return Array.from(set);
}
exports.computePermissions = computePermissions;
