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
participant (Route) Verify ZK proof
participant (Route) Update User
participant (Route) Update User Data
participant (Route) Delete User
participant (Route) Delete User Data
end

box External Components
participant (External) Electronic data verifiection system
participant (External) Zero-Knowledge component
end

box Mongo DB
participant MongoDB_User
participant MongoDB_User_Data
participant MongoDB_User_zkTransactions
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
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Respond - Error invalid token
end

%% Admin creates a new User
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Create New User: (Admin) - Create a new User (i.e. name, email, phone, tempPassword, vendorGroupId, verifierGroupdId)
(Route) Create New User ->>(External) Electronic data verifiection system: Perform an external validation on user data
(External) Electronic data verifiection system -->> (Route) Create New User: Invalid User data
(External) Electronic data verifiection system ->> MongoDB_User: Save User data + unique user _id
MongoDB_User -->> (Route) Create New User: Confirms with Success/Fail
(Route) Create New User -->> User: Responds - Success/Fail
end

%% Admin views a User record by userId
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Admin) - View a User by userId
(Route) Read Only Data ->> MongoDB_User: Verify Admin role and retrieve a matching User document
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Responds - Data + Success/Fail
end

%% Admin views a list of userIds for a specific Vendor or Verifier group
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Admin) - View a list of userIds by vendorGroupId or verifierGroupId
(Route) Read Only Data ->> MongoDB_User: Verify Admin role and retrieve userIds matching query
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Responds - Data + Success/Fail
end

%% Admin updates own user data (Limited to email, phone, password) 
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Update User: (Admin) - Update a Admin User's own data
(Route) Update User ->> MongoDB_User: Verify Admin role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Responds - Success/Fail
end

%% Admin deletes a User record
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Delete User: (Admin) - Delete a user document by userId
(Route) Delete User ->> MongoDB_User: Lookup by userId and delete document in User collection DB
MongoDB_User -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User ->> MongoDB_User_Data: Lookup all personal records matching userId and delete documents in User_Data collection DB
MongoDB_User_Data -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User -->> User: Responds - Success/Fail
end

%% A Vendor User updates own user data (Limited to email, phone, password) 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User: (Vendor) - Update a Vendor User's own data
(Route) Update User ->> MongoDB_User: Verify Vendor role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Responds - Success/Fail
end

%% A Vendor User views personal records 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Vendor) - View a Vendor User's own personal records
(Route) Read Only Data ->> MongoDB_User_Data: Verify Vendor role and retrieve a matching User document
MongoDB_User_Data -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Responds - Data + Success/Fail
end

%% A Vendor User uploads a NEW personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User Data: (Vendor) - Uploads a NEW electronic personal record
(Route) Update User Data ->> (External) Electronic data verifiection system: Perform an external validation on personal data
(External) Electronic data verifiection system -->> (Route) Update User Data: Confirms with Success/Fail
(External) Electronic data verifiection system ->> (External) Zero-Knowledge component: Approved personal data feeds into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Update User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_Data: Create unique id + save personal data + userId + dataType + Merkle Tree + ZK Prof_Root
MongoDB_User_Data -->> (Route) Update User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_zkTransactions: Record changes + userId + dataType + Merkle Tree + ZK Prof_Root + date/time
MongoDB_User_zkTransactions -->> (Route) Update User Data: Confirms with Success/Fail
(Route) Update User Data -->> User: Responds - Success/Fail
end

%% A Vendor User deletes a personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Delete User Data: (Vendor) - Deletes a personal record
%% (Route) Delete User Data ->> (External) Electronic data verifiection system: Perform an external validation on personal data
%% (External) Electronic data verifiection system -->> (Route) Delete User Data: Confirms with Success/Fail
%% (External) Electronic data verifiection system ->> (External) Zero-Knowledge component: Approved personal data feeds into ZKP system to generate a ZK proof
%% (External) Zero-Knowledge component -->> (Route) Delete User Data: Confirms with Success/Fail
(Route) Delete User Data ->> MongoDB_User_Data: Verify Vendor role and delete personal record by id
MongoDB_User_Data -->> (Route) Delete User Data: Confirms with updated data + Success/Fail
(Route) Delete User Data ->> (External) Zero-Knowledge component: Feed updated data into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_Data: Save updated personal data + userId + dataType + Merkle Tree + ZK Prof_Root
MongoDB_User_Data -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_zkTransactions: Record changes + userId + dataType + Merkle Tree + ZK Prof_Root + date/time
MongoDB_User_zkTransactions -->> (Route) Delete User Data: Confirms with Success/Fail
(Route) Delete User Data -->> User: Responds - Success/Fail
end

%% A Verifier User views own user data 
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Read Only Data: (Verifier) - View a Verifier User's own data
(Route) Read Only Data ->> MongoDB_User: Verify Verifier role and retrieve a matching User document
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Responds - Data + Success/Fail
end

%% A Verifier User updates own user data (Limited to email, phone, password) 
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Update User: (Verifier) - Update a Verifier User's own data
(Route) Update User ->> MongoDB_User: Verify Verifier role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Responds - Success/Fail
end

%% A Verifier validates ZK proof of a userId
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Verify ZK proof: (Verifier) - Validate a ZK proof of a Vendor User personal data
(Route) Verify ZK proof ->> MongoDB_User: Verify Verifier role
MongoDB_User ->> (Route) Verify ZK proof: Confirms + Success/Fail
(Route) Verify ZK proof ->> (External) Zero-Knowledge component: Submit input data from verifier
(External) Zero-Knowledge component -->> (Route) Verify ZK proof: Confirms with Verified/Not Verified/Fail
(Route) Verify ZK proof -->> User: Responds - Verified/Not Verified/Fail
end
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