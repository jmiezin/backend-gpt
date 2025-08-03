# 📄 backend-universel/Dockerfile
FROM node:18

# Crée un dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste du code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose le port
EXPOSE 8080

# Démarre l'application
CMD ["npm", "start"]