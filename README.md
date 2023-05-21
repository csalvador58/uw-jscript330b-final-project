# uw-jscript330b-final-project

<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#dependencies">Dependencies</a></li>
        <li><a href="#project-structure">Project Structure</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>
<br/>



<!-- ABOUT THE PROJECT -->
## About The Project


Proposal and Task Breakdown
Your Final Project proposal is due. You should submit a link to a GitHub project that will house your submission. The project README should contain your project proposal. Your proposal should include:

### Scenario
1. A description of the scenario your project is operating in.
> This project serves to provide the back-end and database components for a vendor credentialing (VC) project. The authentication method used in the VC project are zero-knowledge proofs. Due to this, API calls are needed between a UI/Blockchain and the back-end and database.

### Problem
2. A description of what problem your project seeks to solve.
> Third-party data leaks is a common occurrence and rising issue in healthcare.  A way to reduce the issue is to minimize the number of instances personal information is uploaded to databases. All hospital vendors require service workers to upkeep their vendor credentials throughout the year in order to maintain access to any hospital. A pain point in the industry is having a service worker upload the same personal information to different vendor credentialing companies. The process creates additional administrative costs and increases attack vectors that leads to personal data leaks. By applying the principals of a zero-knowledge protocol, zero information from a personal record will be shared to vendor credential companies but still allow for credentials to become verified.

https://www.techtarget.com/searchsecurity/news/252521771/Healthcare-breaches-on-the-rise

### Components
3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
<br>
> Components:
<br>
> Creating user access for employees with assigned roles (i.e. admin, level#)
<br>
> Routes
<br>
> Data models
<br>

#### Sequence Diagrams

```mermaid
sequenceDiagram
%%{init: {'theme':'dark'}}%%

box Authorization
participant User
participant (Route) Login
participant (DAO) Create JWT token
participant (Middleware) Validate User
end

box Routes (After Login)
participant (Route) Create New User
participant (Route) Read Only Data
participant (Route) Update User Data
participant (Route) Delete User
end

box External Components
participant (External) Electronic data verifiection system
participant (External) Zero-Knowledge component
end

box Mongo DB
participant MongoDB_User_Data
participant MongoDB_User
end

%% Any User logs in
rect rgb(0, 102, 51)
User ->> (Route) Login: Sends request to Login with email/password
(Route) Login ->> (DAO) Create JWT token: Validates login - requests a new JWT Token
(DAO) Create JWT token ->> (Route) Login: Generates new JWT Token with UserId and timed token expiration
(Route) Login -->> User: Responds - JWT token
(Route) Login -->> User: Responds - Error not authorized
end

%% Any logged in user requests
User ->> (Middleware) Validate User: All requests require a token validation to retrieve user data (i.e. roles, route access)

%% Admin creates a new User
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Create New User: (Admin) - Create a record for a new user
(Route) Create New User ->>(External) Electronic data verifiection system: Valid User data - First_Name, Last_Name, Vendor_ID
(External) Electronic data verifiection system ->> (External) Zero-Knowledge component: Approved User data feeds into ZKP system to generate a ZK proof
(External) Zero-Knowledge component ->> MongoDB_User: Save new user record with ZK Proof_Root
(External) Electronic data verifiection system -->> (Route) Create New User: Invalid User data
MongoDB_User -->> (Route) Create New User: Confirms with Success/Fail
(Route) Create New User -->> User: Responds - Success/Fail
end

%% A Vendor User views personal records 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (User) - Process request to view a Vendor User's records
(Route) Read Only Data ->> MongoDB_User_Data: Retrieve records matching logged in Vendor User
MongoDB_User_Data -->> (Route) Read Only Data: Confirms with Success/Fail
(Route) Read Only Data -->> User: Responds - Success/Fail
end

%% A Vendor User uploads NEW personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User Data: (User) - User uploads NEW official electronic personal record
(Route) Update User Data ->> (External) Electronic data verifiection system: Verify uploaded NEW official electronic personal record
(External) Electronic data verifiection system ->> (External) Zero-Knowledge component: Approved NEW official electronic personal records
(External) Zero-Knowledge component ->> MongoDB_User_Data: Save NEW official electronic personal records + updated ZK Prof_Root
MongoDB_User_Data -->> (Route) Update User Data: Confirms with Success/Fail
(Route) Update User Data -->> User: Responds - Success/Fail
end

%% Admin deletes a User record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Delete User: (Admin) - Delete a user record
(Route) Delete User ->> MongoDB_User: Lookup UserId and delete record in db
MongoDB_User -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User -->> User: Responds - Success/Fail
end


(External) Zero-Knowledge component -->>(Route) Create New User: Responds - Success/Errors
(Route) Create New User -->> User: Responds - Success/Errors
MongoDB_User -->> (Route) Create New User: Responds - Error - Server

```



### Plan
4. Clear and direct call-outs of how you will meet the various project requirements.

### Timeline
5. A timeline for what project components you plan to complete, week by week, for the remainder of the class. 

<br/>


<br/>

### Dependencies


<br/>

### Project Structure
```

```

<br>

<!-- GETTING STARTED -->
## Getting Started




### Prerequisites


<br/>


<!-- CONTACT -->
## Contact

Chris Salvador

Project Link: [https://github.com/csalvador58/uw-jscript330b-final-project](https://github.com/csalvador58/uw-jscript330b-final-project)

<br/>

<p align="right">(<a href="#readme-top">back to top</a>)</p>