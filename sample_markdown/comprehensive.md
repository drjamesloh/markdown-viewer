# Comprehensive Markdown Test

This file tests all markdown features alongside Mermaid diagrams.

## Headers

# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Text Formatting

**Bold text** and *italic text* and `inline code`.

~~Strikethrough~~ and **_bold italic_**.

## Architecture Overview

Here's a system architecture diagram:

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
    end

    subgraph "API Layer"
        Gateway[API Gateway]
        Auth[Auth Service]
    end

    subgraph "Service Layer"
        UserSvc[User Service]
        OrderSvc[Order Service]
        NotifySvc[Notification Service]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[(Redis)]
        Queue[(RabbitMQ)]
    end

    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Auth --> UserSvc
    Gateway --> OrderSvc
    OrderSvc --> DB
    OrderSvc --> Queue
    Queue --> NotifySvc
    UserSvc --> Cache
    UserSvc --> DB
```

## Data Flow

The following diagram shows how data flows through the system:

```mermaid
sequenceDiagram
    participant U as User
    participant GW as API Gateway
    participant SVC as Order Service
    participant DB as Database
    participant MQ as Message Queue

    U->>GW: Create Order
    GW->>SVC: POST /orders
    SVC->>DB: Save Order
    DB-->>SVC: Order ID
    SVC->>MQ: Publish OrderCreated
    SVC-->>GW: 201 Created
    GW-->>U: Order Confirmation
```

## Code Examples

### Python Example

```python
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Order:
    """Represents a customer order."""
    id: int
    customer_id: int
    total: float
    status: str = "pending"
    created_at: Optional[datetime] = None

    def process(self) -> bool:
        """Process the order."""
        if self.status != "pending":
            return False
        self.status = "processing"
        return True

# Create and process an order
order = Order(
    id=1,
    customer_id=42,
    total=99.99,
    created_at=datetime.now()
)
order.process()
print(f"Order {order.id} status: {order.status}")
```

### JavaScript Example

```javascript
class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
    }

    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }
    }
}

// Usage
const emitter = new EventEmitter();
emitter.on('order:created', (order) => {
    console.log(`New order: ${order.id}`);
});
emitter.emit('order:created', { id: 123 });
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted: Submit
    Submitted --> UnderReview: Assign
    UnderReview --> Approved: Approve
    UnderReview --> Rejected: Reject
    Approved --> Published: Publish
    Rejected --> Draft: Revise
    Published --> [*]
```

## API Reference Table

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/users` | GET | List all users | Required |
| `/api/users` | POST | Create new user | Required |
| `/api/users/{id}` | GET | Get user by ID | Required |
| `/api/users/{id}` | PUT | Update user | Required |
| `/api/users/{id}` | DELETE | Delete user | Admin |
| `/api/orders` | GET | List orders | Required |
| `/api/orders` | POST | Create order | Required |

## Class Diagram

```mermaid
classDiagram
    class User {
        +int id
        +str email
        +str name
        +create_order()
        +get_orders()
    }

    class Order {
        +int id
        +int user_id
        +float total
        +str status
        +process()
        +cancel()
    }

    class Product {
        +int id
        +str name
        +float price
        +int stock
        +update_stock()
    }

    User "1" --> "*" Order : has
    Order "*" --> "*" Product : contains
```

## Blockquotes

> **Note:** This is an important notice about the system.
>
> It can contain multiple paragraphs and even `code`.

## Checklists

- [x] Design architecture
- [x] Implement API layer
- [x] Add authentication
- [ ] Write tests
- [ ] Deploy to production
- [ ] Monitor and optimize

## Pie Chart

```mermaid
pie showData
    title Technology Stack Usage
    "Python" : 40
    "JavaScript" : 30
    "PostgreSQL" : 15
    "Redis" : 10
    "Other" : 5
```

## Gantt Chart

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 14d
    section Development
    Backend API     :a3, after a2, 21d
    Frontend UI     :a4, after a2, 28d
    section Testing
    Unit Tests      :a5, after a3, 7d
    Integration     :a6, after a4, 7d
    section Deployment
    Staging         :a7, after a5, 3d
    Production      :a8, after a6, 3d
```

## Mathematical Notation

The system uses the formula: `E = mc²`

For complex calculations, we use:

```
total = Σ(price_i × quantity_i) for all items
```

## Horizontal Rules

---

Above and below are horizontal rules.

---

## Mixed Content Test

Here's a list with code:

1. First, install dependencies:

   ```bash
   pip install fastapi uvicorn
   ```

2. Then, run the server:

   ```bash
   python app.py myfile.md
   ```

3. Open your browser to `http://localhost:8000`

## Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "is in"
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created
        string status
    }
    PRODUCT {
        int id PK
        string name
        float price
    }
    LINE_ITEM {
        int quantity
        float subtotal
    }
```

## Final Notes

This comprehensive test file demonstrates:

1. All standard markdown features
2. Multiple Mermaid diagram types
3. Syntax highlighted code blocks
4. Tables and lists
5. Various text formatting options

The viewer should render all of these correctly with proper styling and interactivity for the diagrams.