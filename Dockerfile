FROM node:20 AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS api
WORKDIR /api
COPY backend/ ./
COPY --from=web /web/dist/ ./src/main/resources/static/
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=api /api/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]