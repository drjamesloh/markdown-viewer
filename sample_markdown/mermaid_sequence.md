# Mermaid Sequence Diagram Examples

## Simple Sequence Diagram

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

## Sequence Diagram with Activation

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database

    User->>Browser: Click Login
    activate Browser
    Browser->>Server: POST /login
    activate Server
    Server->>Database: Validate credentials
    activate Database
    Database-->>Server: User found
    deactivate Database
    Server-->>Browser: Session token
    deactivate Server
    Browser-->>User: Redirect to dashboard
    deactivate Browser
```

## Sequence Diagram with Alternatives

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: Request data
    alt success
        S->>DB: Query
        DB-->>S: Results
        S-->>C: 200 OK + Data
    else not found
        S-->>C: 404 Not Found
    else error
        S-->>C: 500 Server Error
    end
```

## Sequence Diagram with Parallel

```mermaid
sequenceDiagram
    participant Browser
    participant CDN
    participant API
    participant DB

    par Parallel Requests
        Browser->>CDN: Get static assets
        CDN-->>Browser: JS/CSS files
    and
        Browser->>API: Get user data
        API->>DB: Query user
        DB-->>API: User record
        API-->>Browser: JSON response
    end

    Browser->>Browser: Render page
```

## Sequence Diagram with Notes

```mermaid
sequenceDiagram
    participant Client
    participant LoadBalancer as Load Balancer
    participant AppServer as Application Server
    participant Cache
    participant DB as Database

    Client->>LoadBalancer: HTTP Request
    LoadBalancer->>AppServer: Route to healthy instance

    Note over AppServer,Cache: Cache-Aside Pattern

    AppServer->>Cache: Check cache
    alt Cache Hit
        Cache-->>AppServer: Cached data
    else Cache Miss
        AppServer->>DB: Query database
        DB-->>AppServer: Fresh data
        AppServer->>Cache: Update cache
    end

    AppServer-->>LoadBalancer: Response
    LoadBalancer-->>Client: HTTP Response
```