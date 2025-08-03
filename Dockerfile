# 📄 Dockerfile

FROM node:18

# Dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances + config TypeScript
COPY package*.json tsconfig.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Compilation TypeScript
RUN npm run build

# Vérification que le dossier dist/ est bien créé
RUN ls -la dist

# Port exposé pour Azure (doit matcher process.env.PORT ou 8080)
EXPOSE 8080

# Démarrage de l'application
CMD ["npm", "start"]