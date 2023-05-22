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

### Scenario
> This project serves to provide the back-end and database components for a Vendor Credentialing (VC) application for use in the Healthcare service industry. All vendors that performs work at any hospital or clinic are required to maintain its vendor credentials throughout the year. There is no standard process and every major hospital network outsources to a third-party VC company to handle this service. A hospital network will provide a list of requirements to the third-party VC company to collect from a vendor worker in order to access a location (i.e. identification, background screening, completed training materials, and medical records).

### Problem
2. A description of what problem your project seeks to solve.
> Third-party data leaks are a common occurrence and one that continues to rise in healthcare <cite>[June 2022][1]</cite>.  A way to reduce the issue is to minimize the number of instances personal information are uploaded to databases. A pain point in the industry is having to upload the same personal information to different vendor credentialing companies when access to multiple hospitals are needed. The process creates additional administrative costs and increases attack vectors that leads to personal data leaks. By applying the principals of a zero-knowledge protocol, zero information from a personal record will be shared to vendor credential companies but still allow for credentials to become verified. Solving this problem in the vendor credentialing process could also lead to the adoption of zero-knowledge protocols deeper into the healthcare industry to improve the security of sharing and tracking electronic medical records.

[1]: https://www.techtarget.com/searchsecurity/news/252521771/Healthcare-breaches-on-the-rise

### Components
<!-- 3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc. -->
Routes:
- Login - A user will be required to login with an username/password to obtain a JWT token. This route will deny access if required inputs are not received in a request.
- Middleware - A request that holds a Bearer token will be validated before accessing subsequent functions.  Token expiration will occur after 15 mins which a new token will be generated for any activity within the the last 5 mins of the 15 min window.
<br>

Data models:

<br>

#### Sequence Diagram

> Full Sequence
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
participant (External) Electronic data verification system
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
(Route) Login -->> User: Response - JWT token
(Route) Login -->> User: Response - Error not authorized
end

%% Any logged in user requests
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Response - Error invalid token
end

%% Admin creates a new User
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Create New User: (Admin) - Create a new User (i.e. name, email, phone, tempPassword, vendorGroupId, verifierGroupId)
(Route) Create New User ->>(External) Electronic data verification system: Perform an external validation on user data
(External) Electronic data verification system -->> (Route) Create New User: Invalid User data
(External) Electronic data verification system ->> MongoDB_User: Save User data + unique user _id
MongoDB_User -->> (Route) Create New User: Confirms with Success/Fail
(Route) Create New User -->> User: Response - Success/Fail
end

%% Admin views a User record by userId
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Admin) - View a User by userId
(Route) Read Only Data ->> MongoDB_User: Verify Admin role and retrieve a matching User document
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% Admin views a list of userIds for a specific Vendor or Verifier group
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Admin) - View a list of userIds by vendorGroupId or verifierGroupId
(Route) Read Only Data ->> MongoDB_User: Verify Admin role and retrieve userIds matching query
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% Admin updates own user data (Limited to email, phone, password) 
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Update User: (Admin) - Update a Admin User's own data
(Route) Update User ->> MongoDB_User: Verify Admin role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Response - Success/Fail
end

%% Admin deletes a User record
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Delete User: (Admin) - Delete a user document by userId
(Route) Delete User ->> MongoDB_User: Lookup by userId and delete document in User collection DB
MongoDB_User -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User ->> MongoDB_User_Data: Lookup all personal records matching userId and delete documents in User_Data collection DB
MongoDB_User_Data -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User -->> User: Response - Success/Fail
end

%% A Vendor User updates own user data (Limited to email, phone, password) 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User: (Vendor) - Update a Vendor User's own data
(Route) Update User ->> MongoDB_User: Verify Vendor role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Response - Success/Fail
end

%% A Vendor User views personal records 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Vendor) - View a Vendor User's own personal records
(Route) Read Only Data ->> MongoDB_User_Data: Verify Vendor role and retrieve a matching User document
MongoDB_User_Data -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% A Vendor User uploads a NEW personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User Data: (Vendor) - Uploads a NEW electronic personal record
(Route) Update User Data ->> (External) Electronic data verification system: Perform an external validation on personal data
(External) Electronic data verification system -->> (Route) Update User Data: Confirms with Success/Fail
(External) Electronic data verification system ->> (External) Zero-Knowledge component: Approved personal data feeds into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Update User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_Data: Create unique id + save personal data + userId + dataType + Merkle Tree + ZK Proof_Root
MongoDB_User_Data -->> (Route) Update User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_zkTransactions: Record changes + userId + dataType + Merkle Tree + ZK Proof_Root + date/time
MongoDB_User_zkTransactions -->> (Route) Update User Data: Confirms with Success/Fail
(Route) Update User Data -->> User: Response - Success/Fail
end

%% A Vendor User deletes a personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Delete User Data: (Vendor) - Deletes a personal record
(Route) Delete User Data ->> (External) Electronic data verification system: Perform an external validation on personal data
(External) Electronic data verification system -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Electronic data verification system ->> (External) Zero-Knowledge component: Approved personal data feeds into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Delete User Data: Confirms with Success/Fail
(Route) Delete User Data ->> MongoDB_User_Data: Verify Vendor role and delete personal record by id
MongoDB_User_Data -->> (Route) Delete User Data: Confirms with updated data + Success/Fail
(Route) Delete User Data ->> (External) Zero-Knowledge component: Feed updated data into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_Data: Save updated personal data + userId + dataType + Merkle Tree + ZK Proof_Root
MongoDB_User_Data -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_zkTransactions: Record changes + userId + dataType + Merkle Tree + ZK Proof_Root + date/time
MongoDB_User_zkTransactions -->> (Route) Delete User Data: Confirms with Success/Fail
(Route) Delete User Data -->> User: Response - Success/Fail
end

%% A Verifier User views own user data 
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Read Only Data: (Verifier) - View a Verifier User's own data
(Route) Read Only Data ->> MongoDB_User: Verify Verifier role and retrieve a matching User document
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% A Verifier User updates own user data (Limited to email, phone, password) 
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Update User: (Verifier) - Update a Verifier User's own data
(Route) Update User ->> MongoDB_User: Verify Verifier role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Response - Success/Fail
end

%% A Verifier validates ZK proof of a userId
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Verify ZK proof: (Verifier) - Validate a ZK proof of a Vendor User personal data
(Route) Verify ZK proof ->> MongoDB_User: Verify Verifier role
MongoDB_User ->> (Route) Verify ZK proof: Confirms + Success/Fail
(Route) Verify ZK proof ->> (External) Zero-Knowledge component: Submit input data from verifier
(External) Zero-Knowledge component -->> (Route) Verify ZK proof: Confirms with Verified/Not Verified/Fail
(Route) Verify ZK proof -->> User: Response - Verified/Not Verified/Fail
end
```

> Authorization
```mermaid
sequenceDiagram
%%{init: {'theme':'dark'}}%%

box Authorization
participant User
participant (Route) Login
participant (DAO) Create JWT token
participant (Middleware) Validate User
end

%% Any User logs in
rect rgb(0, 102, 51)
User ->> (Route) Login: Sends request to Login with email/password
(Route) Login ->> (DAO) Create JWT token: Validates login - requests a new JWT Token
(DAO) Create JWT token ->> (Route) Login: Generates new JWT Token with UserId and timed token expiration
(Route) Login -->> User: Response - JWT token
(Route) Login -->> User: Response - Error not authorized
end

%% Any logged in user requests
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Response - Error invalid token
end
```

> Create routes
```mermaid
sequenceDiagram
%%{init: {'theme':'dark'}}%%

box Authorization
participant User
participant (Middleware) Validate User
end

box Routes (After Login)
participant (Route) Create New User
end

box External Components
participant (External) Electronic data verification system
end

box Mongo DB
participant MongoDB_User
end

%% Any logged in user requests
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Response - Error invalid token
end

%% Admin creates a new User
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Create New User: (Admin) - Create a new User (i.e. name, email, phone, tempPassword, vendorGroupId, verifierGroupId)
(Route) Create New User ->>(External) Electronic data verification system: Perform an external validation on user data
(External) Electronic data verification system -->> (Route) Create New User: Invalid User data
(External) Electronic data verification system ->> MongoDB_User: Save User data + unique user _id
MongoDB_User -->> (Route) Create New User: Confirms with Success/Fail
(Route) Create New User -->> User: Response - Success/Fail
end
```

> Read routes
```mermaid
sequenceDiagram
%%{init: {'theme':'dark'}}%%

box Authorization
participant User
participant (Middleware) Validate User
end

box Routes (After Login)
participant (Route) Read Only Data
participant (Route) Verify ZK proof
end

box External Components
participant (External) Electronic data verification system
participant (External) Zero-Knowledge component
end

box Mongo DB
participant MongoDB_User
participant MongoDB_User_Data
end

%% Any logged in user requests
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Response - Error invalid token
end

%% Admin views a User record by userId
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Admin) - View a User by userId
(Route) Read Only Data ->> MongoDB_User: Verify Admin role and retrieve a matching User document
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% Admin views a list of userIds for a specific Vendor or Verifier group
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Admin) - View a list of userIds by vendorGroupId or verifierGroupId
(Route) Read Only Data ->> MongoDB_User: Verify Admin role and retrieve userIds matching query
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% A Vendor User views personal records 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Read Only Data: (Vendor) - View a Vendor User's own personal records
(Route) Read Only Data ->> MongoDB_User_Data: Verify Vendor role and retrieve a matching User document
MongoDB_User_Data -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% A Verifier User views own user data 
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Read Only Data: (Verifier) - View a Verifier User's own data
(Route) Read Only Data ->> MongoDB_User: Verify Verifier role and retrieve a matching User document
MongoDB_User -->> (Route) Read Only Data: Confirms with data + Success/Fail
(Route) Read Only Data -->> User: Response - Data + Success/Fail
end

%% A Verifier validates ZK proof of a userId
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Verify ZK proof: (Verifier) - Validate a ZK proof of a Vendor User personal data
(Route) Verify ZK proof ->> MongoDB_User: Verify Verifier role
MongoDB_User ->> (Route) Verify ZK proof: Confirms + Success/Fail
(Route) Verify ZK proof ->> (External) Zero-Knowledge component: Submit input data from verifier
(External) Zero-Knowledge component -->> (Route) Verify ZK proof: Confirms with Verified/Not Verified/Fail
(Route) Verify ZK proof -->> User: Response - Verified/Not Verified/Fail
end
```

> Update Routes
```mermaid
sequenceDiagram
%%{init: {'theme':'dark'}}%%

box Authorization
participant User
participant (Middleware) Validate User
end

box Routes (After Login)
participant (Route) Update User
participant (Route) Update User Data
end

box External Components
participant (External) Electronic data verification system
participant (External) Zero-Knowledge component
end

box Mongo DB
participant MongoDB_User
participant MongoDB_User_Data
participant MongoDB_User_zkTransactions
end

%% Any logged in user requests
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Response - Error invalid token
end

%% Admin updates own user data (Limited to email, phone, password) 
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Update User: (Admin) - Update a Admin User's own data
(Route) Update User ->> MongoDB_User: Verify Admin role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Response - Success/Fail
end

%% A Vendor User updates own user data (Limited to email, phone, password) 
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User: (Vendor) - Update a Vendor User's own data
(Route) Update User ->> MongoDB_User: Verify Vendor role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Response - Success/Fail
end

%% A Vendor User uploads a NEW personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Update User Data: (Vendor) - Uploads a NEW electronic personal record
(Route) Update User Data ->> (External) Electronic data verification system: Perform an external validation on personal data
(External) Electronic data verification system -->> (Route) Update User Data: Confirms with Success/Fail
(External) Electronic data verification system ->> (External) Zero-Knowledge component: Approved personal data feeds into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Update User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_Data: Create unique id + save personal data + userId + dataType + Merkle Tree + ZK Proof_Root
MongoDB_User_Data -->> (Route) Update User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_zkTransactions: Record changes + userId + dataType + Merkle Tree + ZK Proof_Root + date/time
MongoDB_User_zkTransactions -->> (Route) Update User Data: Confirms with Success/Fail
(Route) Update User Data -->> User: Response - Success/Fail
end

%% A Verifier User updates own user data (Limited to email, phone, password) 
rect rgb(76, 0, 153)
(Middleware) Validate User ->> (Route) Update User: (Verifier) - Update a Verifier User's own data
(Route) Update User ->> MongoDB_User: Verify Verifier role and update limited to email, phone, password
MongoDB_User -->> (Route) Update User: Confirms with Success/Fail
(Route) Update User -->> User: Response - Success/Fail
end
```

> Delete Routes
```mermaid
sequenceDiagram
%%{init: {'theme':'dark'}}%%

box Authorization
participant User
participant (Middleware) Validate User
end

box Routes (After Login)
participant (Route) Delete User
participant (Route) Delete User Data
end

box External Components
participant (External) Electronic data verification system
participant (External) Zero-Knowledge component
end

box Mongo DB
participant MongoDB_User
participant MongoDB_User_Data
participant MongoDB_User_zkTransactions
end

%% Any logged in user requests
rect rgb(18, 65, 195)
User ->> (Middleware) Validate User: All requests require a valid token
(Middleware) Validate User -->> User: Response - Error invalid token
end

%% Admin deletes a User record
rect rgb(0, 128, 255)
(Middleware) Validate User ->> (Route) Delete User: (Admin) - Delete a user document by userId
(Route) Delete User ->> MongoDB_User: Lookup by userId and delete document in User collection DB
MongoDB_User -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User ->> MongoDB_User_Data: Lookup all personal records matching userId and delete documents in User_Data collection DB
MongoDB_User_Data -->> (Route) Delete User: Confirms with Success/Fail
(Route) Delete User -->> User: Response - Success/Fail
end

%% A Vendor User deletes a personal record
rect rgb(127, 0, 255)
(Middleware) Validate User ->> (Route) Delete User Data: (Vendor) - Deletes a personal record
(Route) Delete User Data ->> (External) Electronic data verification system: Perform an external validation on personal data
(External) Electronic data verification system -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Electronic data verification system ->> (External) Zero-Knowledge component: Approved personal data feeds into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Delete User Data: Confirms with Success/Fail
(Route) Delete User Data ->> MongoDB_User_Data: Verify Vendor role and delete personal record by id
MongoDB_User_Data -->> (Route) Delete User Data: Confirms with updated data + Success/Fail
(Route) Delete User Data ->> (External) Zero-Knowledge component: Feed updated data into ZKP system to generate a ZK proof
(External) Zero-Knowledge component -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_Data: Save updated personal data + userId + dataType + Merkle Tree + ZK Proof_Root
MongoDB_User_Data -->> (Route) Delete User Data: Confirms with Success/Fail
(External) Zero-Knowledge component ->> MongoDB_User_zkTransactions: Record changes + userId + dataType + Merkle Tree + ZK Proof_Root + date/time
MongoDB_User_zkTransactions -->> (Route) Delete User Data: Confirms with Success/Fail
(Route) Delete User Data -->> User: Response - Success/Fail
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