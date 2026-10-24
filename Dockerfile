# Build: compile the site and save each page as static HTML (scripts/snapshot.mjs).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Which TribeTravel the site reads its content (and chat) from. Set as build variables in Coolify to point a test
# build at TribeTravel dev; the defaults are production and Paper Plane.
ARG VITE_TRIBETRAVEL_URL=https://tribetravel.io
ARG VITE_AGENCY_SLUG=paper-plane-travel-tours
ENV VITE_TRIBETRAVEL_URL=$VITE_TRIBETRAVEL_URL VITE_AGENCY_SLUG=$VITE_AGENCY_SLUG
RUN npm run build:static

# Serve: plain nginx, no Node at runtime.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
