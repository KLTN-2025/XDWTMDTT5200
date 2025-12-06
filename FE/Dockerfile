# =====================================================
# 1) Build React app
# =====================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package trước để cache tốt
COPY package*.json ./
RUN npm install

# Copy code FE
COPY . .

# Build FE
RUN npm run build


# =====================================================
# 2) Serve bằng Nginx (Production)
# =====================================================
FROM nginx:1.25-alpine

# Copy build từ stage 1 → nginx serve static
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config (optional nếu muốn SPA rewrite)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



