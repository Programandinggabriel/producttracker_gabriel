FROM node
#Hacia donde trabajara la app dentro del contenedor
WORKDIR /app
#Archivos a copiar del proyecto, (./) aloja en el dir actual (/app) de la imagen
COPY package*.json ./
RUN npm install
#Todo lo disponible en el build context, hacia el dir actual (/app)
COPY . .
#Comandos de inicializacion del contenedor
CMD [ "npm", "start" ]