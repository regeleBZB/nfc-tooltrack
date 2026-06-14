FROM node:20 AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
RUN echo "=== DIST TREE ===" && ls -laR /web/dist && test -f /web/dist/index.html

FROM maven:3.9-eclipse-temurin-17 AS api
WORKDIR /api
COPY backend/ ./
COPY --from=web /web/dist/ ./src/main/resources/static/
RUN echo "=== STATIC AFTER COPY ===" && ls -laR ./src/main/resources/static && test -f ./src/main/resources/static/index.html
RUN mvn clean package -DskipTests
RUN echo "=== JAR STATIC ===" && jar tf target/*.jar | grep static

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=api /api/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]