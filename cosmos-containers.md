# Architecture des containers CosmosDB pour `isonic-ai`

| Nom de container | Clé de partition  | TTL par défaut (s) | Mode d’indexation |
|:-----------------|:-----------------:|:------------------:|:------------------:|
| users            | `/userId`         | —                  | consistent        |
| projects         | `/userId`         | —                  | consistent        |
| conversations    | `/projectId`      | —                  | consistent        |
| messages         | `/conversationId` | —                  | consistent        |
| memory           | `/userId`         | —                  | consistent        |
| assistants       | `/userId`         | —                  | consistent        |

---

## 🗄️ `users`

- **Partition Key** : `/userId`  
- **TTL** : —  
- **Indexing** : consistent  

### Champs obligatoires  
| Champ    | Type   | Description                           |
|:---------|:------:|:--------------------------------------|
| `id`     | string | Identifiant unique du document (GUID) |
| `userId` | string | Même valeur que `id`, sert de PK      |

### Champs optionnels  
| Champ         | Type    | Description                                    |
|:--------------|:-------:|:-----------------------------------------------|
| `name`        | string  | Nom affiché de l’utilisateur                   |
| `email`       | string  | Adresse e-mail                                 |
| `createdAt`   | iso8601 | Date de création du compte                     |
| `role`        | string  | Rôle / niveau d’accès (ex. “admin”, “user”)    |
| `preferences` | object  | Options utilisateur (thème, langue, etc.)      |

---

## 🗄️ `projects`

- **Partition Key** : `/userId`  
- **TTL** : —  
- **Indexing** : consistent  

### Champs obligatoires  
| Champ      | Type   | Description                         |
|:-----------|:------:|:------------------------------------|
| `userId`   | string | Propriétaire (clé de partition)     |
| `title`    | string | Titre du projet                     |

### Champs optionnels  
| Champ         | Type     | Description                                   |
|:--------------|:--------:|:----------------------------------------------|
| `description` | string   | Description textuelle                         |
| `settings`    | object   | Configuration spécifique (JSON)               |
| `createdAt`   | iso8601  | Date de création                              |
| `updatedAt`   | iso8601  | Date de dernière modification                 |

---

## 🗄️ `conversations`

- **Partition Key** : `/projectId`  
- **TTL** : —  
- **Indexing** : consistent  

### Champs obligatoires  
| Champ         | Type   | Description                              |
|:--------------|:------:|:-----------------------------------------|
| `projectId`   | string | Référence au projet parent (PK)          |
| `title`       | string | Titre ou sujet de la conversation        |

### Champs optionnels  
| Champ       | Type     | Description                                |
|:------------|:--------:|:-------------------------------------------|
| `createdAt` | iso8601  | Date de création                           |
| `createdBy` | string   | `userId` de l’auteur (UID)                 |
| `metadata`  | object   | Données additionnelles (tags, statut, etc.) |

---

## 🗄️ `messages`

- **Partition Key** : `/conversationId`  
- **TTL** : —  
- **Indexing** : consistent  

### Champs obligatoires  
| Champ             | Type   | Description                           |
|:------------------|:------:|:--------------------------------------|
| `conversationId`  | string | Référence à la conversation (PK)      |
| `userId`          | string | Auteur du message (UID)               |
| `role`            | string | `"user"` ou `"assistant"`             |
| `content`         | string | Texte du message                      |

### Champs optionnels  
| Champ         | Type    | Description                              |
|:--------------|:-------:|:-----------------------------------------|
| `createdAt`   | iso8601 | Horodatage                               |
| `attachments` | array   | URLs ou métadonnées de fichiers joints   |

---

## 🗄️ `memory`

- **Partition Key** : `/userId`  
- **TTL** : —  
- **Indexing** : consistent  

### Champs obligatoires  
| Champ    | Type   | Description                     |
|:---------|:------:|:--------------------------------|
| `userId` | string | Utilisateur associé (PK)        |
| `key`    | string | Clé sémantique (ex. “lastTopic”)|
| `value`  | any    | Valeur stockée                  |

### Champs optionnels  
| Champ       | Type     | Description                              |
|:------------|:--------:|:-----------------------------------------|
| `id`        | string   | GUID de l’entrée mémoire                 |
| `createdAt` | iso8601  | Horodatage de la création                |

---

## 🗄️ `assistants`

- **Partition Key** : `/userId`  
- **TTL** : —  
- **Indexing** : consistent  

### Champs obligatoires  
| Champ      | Type   | Description                        |
|:-----------|:------:|:-----------------------------------|
| `userId`   | string | Propriétaire (clé de partition)    |
| `name`     | string | Nom donné à l’assistant            |
| `config`   | object | Configuration (prompts, paramètres)|

### Champs optionnels  
| Champ        | Type     | Description                           |
|:-------------|:--------:|:--------------------------------------|
| `id`         | string   | GUID de l’assistant                   |
| `createdAt`  | iso8601  | Date de création                      |
| `updatedAt`  | iso8601  | Date de dernière mise à jour          |