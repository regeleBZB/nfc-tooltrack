FROM node:20 AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm install --include=dev
COPY frontend/ ./
RUN npx vite build

FROM maven:3.9-eclipse-temurin-17 AS api
WORKDIR /api
ARG CACHEBUST=3
COPY backend/ ./
COPY --from=web /web/dist/ ./src/main/resources/static/
RUN mvn clean package -DskipTests
RUN jar tf target/*.jar | grep "static/assets" || (echo "NO ASSETS IN JAR" && exit 1)

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=api /api/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]