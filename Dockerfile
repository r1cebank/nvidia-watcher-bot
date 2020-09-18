# ---- Base Node ----
FROM node:lts AS base
# Create app directory
WORKDIR /src

# ---- Dependencies ----
FROM base AS dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# install app dependencies including 'devDependencies'
RUN npm install

# --- Release with Alpine ----
FROM node:lts-alpine AS release
# Create app directory
WORKDIR /app
COPY --from=dependencies /src/package.json ./
# Install app dependencies
RUN npm install --only=production
COPY src ./
COPY config ./config
RUN mkdir db
CMD ["node", "index.js"]
