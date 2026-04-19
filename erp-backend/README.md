# ERP Backend (Spring Boot)

Converted to Spring Boot 3.x with Java 17.

Dependencies added:
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- com.microsoft.sqlserver:mssql-jdbc
- lombok

Quick run:

1. Build:

   mvn -U -DskipTests clean package

2. Run:

   java -jar target/erp-backend-0.0.1-SNAPSHOT.jar

Edit `src/main/resources/application.properties` for your database credentials.