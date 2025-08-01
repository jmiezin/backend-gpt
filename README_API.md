# 📘 Documentation API – iSonic AI

Cette API permet de gérer les assistants, d'interroger Azure OpenAI, d'accéder aux permissions utilisateurs, et d'utiliser ngrok de façon sécurisée.

Chaque route est protégée par un middleware `validateAccessToken(scope)` vérifiant la présence du **scope OAuth 2.0** requis dans le token JWT Microsoft Entra ID (anciennement Azure AD).

---

## 🔐 Table des scopes utilisés

| Scope MSAL                  | Description                                                    |
|----------------------------|----------------------------------------------------------------|
| `assistants.access`        | Autorise l'accès en lecture/écriture aux assistants            |
| `permissions.access`       | Autorise la lecture des rôles et permissions de l'utilisateur |
| `openai.access`            | Autorise l'accès aux capacités Azure OpenAI                    |
| `scan.access`              | Accès restreint au mode "scan" utilisant OpenAI                |
| `access:ngrok`             | Accès à l'infrastructure locale exposée via ngrok              |

---

## 📂 Endpoints

### 🧠 `GET /assistants`

- **Description** : Récupère tous les assistants, triés par date de création décroissante.
- **Méthode** : `GET`
- **Scope requis** : `assistants.access`
- **Réponse** : JSON array d’assistants

---

### ➕ `POST /assistants`

- **Description** : Crée un nouvel assistant.
- **Méthode** : `POST`
- **Scope requis** : `assistants.access`
- **Corps attendu (JSON)** :

```json
{
  "name": "Assistant X",
  "description": "Description de l’assistant",
  "instructions": "Instructions de l’assistant",
  "userId": "UUID de l’utilisateur"
}
```

- **Réponse** : JSON de l’assistant créé

---

### 🧾 `GET /permissions`

- **Description** : Renvoie les rôles et permissions de l'utilisateur authentifié.
- **Méthode** : `GET`
- **Scope requis** : `permissions.access`
- **Réponse** :

```json
{
  "userId": "sub",
  "roles": [],
  "permissions": []
}
```

---

### 🔎 `POST /scan`

- **Description** : Pose une question courte en mode "scan" via Azure OpenAI (max_tokens: 1200).
- **Méthode** : `POST`
- **Scope requis** : `scan.access`
- **Corps attendu (JSON)** :

```json
{
  "question": "Peux-tu me résumer cette API ?"
}
```

- **Réponse** :

```json
{
  "answer": "Voici un résumé clair de l’API..."
}
```

---

### 🌐 `POST /ngrok`

- **Description** : (Interne) Test d’un tunnel ngrok, requiert un scope restreint.
- **Méthode** : `POST`
- **Scope requis** : `access:ngrok`
- **Corps attendu** : libre

---

## 🧪 Test d'une route via `curl`

```bash
curl -X GET http://localhost:3000/assistants \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 📝 Notes techniques

- L'authentification est centralisée avec le middleware :
```ts
router.use(validateAccessToken("scope.requis"));
```

- Les scopes sont définis dans :
```ts
// 📄 src/lib/scopes.ts
export const apiScopes: string[] = [...]
```

---

## 📚 À venir (suggestions)

- `DELETE /assistants/:id` (avec confirmation)
- `PUT /assistants/:id` (édition des instructions)
- Pagination des résultats
- Ajout de rôles dynamiques dans Azure Entra ID
