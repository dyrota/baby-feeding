## Baby Feeding Tracking

This project provides a RESTful API for easily and accurately tracking the feeding data on infants, such as frequency, duration, and amount.

## Features
- The application is capable of creating, securely authenticating, and updating users and their information.
- "ADMIN" users are authorized to create, edit or delete feeding data for their account.
- "PHYSICIANS" users are authorized to access the feeding data of specific users by their patient ID.
- Information such as average duration each milking session takes place and the average amount consumed are displayed in charts across a user specified period. By default, data across all time is displayed.
- Both types of users are able to change their passwords using 

## Stack
- **Frontend:** Bootstrap + jQuery
- **Backend:** Spring Boot
- **Database:** PostgreSQL

## Setup and Installation
1. Clone the repository
2. Install PostgreSQL and create a new database. Adjust `application.properties` file or setup environment variables with your database credentials and connection details.
3. Build the project using Maven (`mvn clean install`).
4. Run the application (`mvn spring-boot:run`).
5. The application will start and is accessible at `http://localhost:8080`.