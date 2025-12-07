FROM node:18-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package trước để tối ưu cache
COPY package*.json ./

# Cài dependency
RUN npm install --production

# Copy toàn bộ code
COPY . .

EXPOSE 5000

# Start app
CMD ["npm", "start"]






