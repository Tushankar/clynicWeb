# Clinic Web — React + Vite SPA. Multi-stage: build static assets, serve with nginx.
# The API base URL is baked in at BUILD time (Vite inlines VITE_* env), so pass it as a build arg:
#   docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t clinic-web ./clynicWeb
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
# Clerk publishable key + API URL are compile-time for a Vite SPA.
ARG VITE_API_BASE_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
