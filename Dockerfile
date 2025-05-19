FROM node:20

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

COPY nginx.conf /etc/nginx/nginx.conf

RUN chmod +x ./start.sh

# Nginx
EXPOSE 80

CMD ["./start.sh"]
