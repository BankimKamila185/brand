# Practical 3: UML Design & Software Architecture for E-Commerce System (Tevar)

---

## 1. Problem Analysis & Requirement Gathering (SRS Overview)

### 1.1 Problem Statement
Modern fashion e-commerce requires high-availability browsing, instant inventory reservation, secure multi-channel payments, and role-based administrative control. Traditional monolithic web applications suffer from scalability bottlenecks during flash sales, tight coupling between catalog and order management, and inadequate real-time state synchronization.

### 1.2 System Objectives
* **Scalable Micro-Modular Architecture:** Decouple customer-facing storefronts (Next.js/Vercel) from core business logic (Express REST API on Render).
* **Guaranteed ACID Transactions:** Maintain data integrity across order creation, inventory stock deduction, and payment capture.
* **Low Latency Catalog Search & Asset Delivery:** Zero-egress CDN storage (Cloudflare R2) and Redis-backed rate limiting & caching.
* **Role-Based Access Control (RBAC):** Distinct permissions for `CUSTOMER`, `ADMIN`, and `SUPER_ADMIN`.

### 1.3 Functional Requirements (FR)
| ID | Requirement Name | Description | Actors Involved |
| :--- | :--- | :--- | :--- |
| **FR-01** | User Authentication & Profile | Register, login via JWT (Access + Refresh token), manage addresses. | Customer, Admin |
| **FR-02** | Catalog Browsing & Search | Filter products by category, size, price, and full-text keyword search. | Customer, Guest |
| **FR-03** | Cart & Wishlist Management | Add/remove items, update quantities, persist cart in session/database. | Customer |
| **FR-04** | Order Lifecycle & Checkout | Create order, validate stock, compute taxes/coupons, initiate payment. | Customer, System |
| **FR-05** | Payment Gateway Integration | Process payments via Razorpay webhook signature verification. | Customer, Razorpay, System |
| **FR-06** | Inventory & Stock Control | Auto-decrement stock upon order placement, restock on payment failure/cancellation. | System, Admin |
| **FR-07** | Admin Operations & Analytics | Manage products, view sales reports, update shipping tracking statuses. | Admin, Super Admin |

### 1.4 Non-Functional Requirements (NFR)
* **Performance:** API response time $< 150\text{ ms}$ for $95\%$ of catalog requests.
* **Security:** OWASP compliance, Helmet headers, CORS policies, Bcrypt password hashing (12 rounds), JWT tokens.
* **Availability & Reliability:** $99.9\%$ uptime leveraging serverless Neon PostgreSQL and edge-routed Vercel CDN.
* **Maintainability:** Modular Layered Architecture (Controller $\rightarrow$ Service $\rightarrow$ Data Access Layer with Prisma ORM).

---

## 2. UML Diagrams & Modeling

---

### 2.1 Use Case Diagram
Illustrates interactions between system actors (Guest, Customer, Admin, Payment Gateway) and system features.

```mermaid
usecaseDiagram
%% Actor definitions
actor Customer as "Customer / User"
actor Admin as "Store Admin"
actor Razorpay as "Payment Gateway"
actor NotificationService as "Email / SMS Service"

rectangle "Tevar E-Commerce System" {
    usecase UC_Auth as "Authenticate (Login / Register / JWT)"
    usecase UC_Browse as "Browse / Search Products"
    usecase UC_Cart as "Manage Cart & Wishlist"
    usecase UC_Checkout as "Checkout & Place Order"
    usecase UC_Pay as "Process Payment"
    usecase UC_Track as "Track Order Status"
    usecase UC_ApplyCoupon as "Apply Discount Coupon"
    usecase UC_ManageInventory as "Manage Products & Inventory"
    usecase UC_ManageOrders as "Update Fulfillment & Shipping"
    usecase UC_ViewAnalytics as "View Sales & Revenue Analytics"
    usecase UC_SendReceipt as "Send Order Confirmation"
}

%% Customer associations
Customer --> UC_Auth
Customer --> UC_Browse
Customer --> UC_Cart
Customer --> UC_Checkout
Customer --> UC_Track

%% Inclusions and Extensions
UC_Checkout ..> UC_Pay : <<include>>
UC_Checkout ..> UC_ApplyCoupon : <<extend>>
UC_Pay ..> UC_SendReceipt : <<include>>

%% External Actor associations
UC_Pay --> Razorpay
UC_SendReceipt --> NotificationService

%% Admin associations
Admin --> UC_Auth
Admin --> UC_ManageInventory
Admin --> UC_ManageOrders
Admin --> UC_ViewAnalytics
```

---

### 2.2 Class Diagram
Models the structural domain entities, attributes, methods, and relationships within the backend database schema.

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String passwordHash
        +String role
        +String firstName
        +String lastName
        +String phone
        +register()
        +login()
        +updateProfile()
    }

    class Address {
        +String id
        +String userId
        +String street
        +String city
        +String state
        +String postalCode
        +String country
        +Boolean isDefault
    }

    class Product {
        +String id
        +String title
        +String slug
        +String description
        +Decimal price
        +Decimal compareAtPrice
        +String status
        +getVariants()
        +checkStock()
    }

    class ProductVariant {
        +String id
        +String productId
        +String sku
        +String size
        +String color
        +Int inventoryStock
        +reserveStock(qty)
        +releaseStock(qty)
    }

    class Category {
        +String id
        +String name
        +String slug
        +String parentId
    }

    class Cart {
        +String id
        +String userId
        +Decimal subtotal
        +addItem(variantId, qty)
        +removeItem(itemId)
        +clearCart()
    }

    class CartItem {
        +String id
        +String cartId
        +String variantId
        +Int quantity
        +Decimal unitPrice
    }

    class Order {
        +String id
        +String orderNumber
        +String userId
        +String shippingAddressId
        +Decimal totalAmount
        +Decimal discountAmount
        +String orderStatus
        +String paymentStatus
        +createOrder()
        +cancelOrder()
        +updateStatus(status)
    }

    class OrderItem {
        +String id
        +String orderId
        +String variantId
        +Int quantity
        +Decimal price
    }

    class Payment {
        +String id
        +String orderId
        +String razorpayPaymentId
        +String razorpayOrderId
        +Decimal amount
        +String status
        +verifySignature(sig)
        +capturePayment()
    }

    %% Relationships
    User "1" *-- "0..*" Address : has
    User "1" -- "0..1" Cart : owns
    User "1" -- "0..*" Order : places
    Cart "1" *-- "0..*" CartItem : contains
    Product "1" *-- "1..*" ProductVariant : has
    Category "1" o-- "0..*" Product : categorizes
    ProductVariant "1" -- "0..*" CartItem : referenced_in
    Order "1" *-- "1..*" OrderItem : contains
    ProductVariant "1" -- "0..*" OrderItem : fulfills
    Order "1" -- "1" Payment : settled_by
```

---

### 2.3 Activity Diagram (Order Placement & Checkout Flow)
Models the dynamic workflow from cart checkout to payment validation and order finalization.

```mermaid
stateDiagram-v2
    [*] --> ViewCart: User proceeds to checkout
    ViewCart --> CheckAuthentication: Click 'Proceed to Checkout'
    
    state CheckAuthentication <<choice>>
    CheckAuthentication --> LoginScreen: Not Authenticated
    LoginScreen --> CheckAuthentication: Authenticated
    CheckAuthentication --> SelectShippingAddress: Authenticated
    
    SelectShippingAddress --> ApplyCoupon: Select / Enter Address
    ApplyCoupon --> CheckInventoryStock: Confirm Order Summary
    
    state CheckInventoryStock <<choice>>
    CheckInventoryStock --> OutOfStockError: Stock < Requested Qty
    OutOfStockError --> ViewCart: Prompt user to update Cart
    
    CheckInventoryStock --> CreatePendingOrder: Stock Available
    CreatePendingOrder --> ReserveInventoryStock: Lock Variant Stock (Temporary)
    ReserveInventoryStock --> InitiateRazorpayPayment: Generate Razorpay Order ID
    
    InitiateRazorpayPayment --> AwaitPaymentResponse: Launch Payment Modal
    
    state AwaitPaymentResponse <<choice>>
    AwaitPaymentResponse --> VerifySignature: Payment Success
    AwaitPaymentResponse --> ReleaseInventoryStock: Payment Failed / Dismissed
    
    ReleaseInventoryStock --> OrderFailedState: Mark Order as FAILED
    OrderFailedState --> [*]
    
    VerifySignature --> CapturePayment: Valid Signature
    CapturePayment --> FinalizeOrder: Mark Order CONFIRMED & PAID
    FinalizeOrder --> DispatchNotifications: Send Email & Push Receipt
    DispatchNotifications --> OrderSuccessPage: Display Confirmation
    OrderSuccessPage --> [*]
```

---

### 2.4 Sequence Diagram (Checkout & Payment Verification)
Details time-ordered message exchanges across Client, API Controller, Payment Gateway, and Database.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Storefront (Next.js)
    participant API as Order API (Express)
    participant DB as Neon DB (Prisma)
    participant Razorpay as Razorpay Gateway

    Customer->>Frontend: Click "Place Order & Pay"
    Frontend->>API: POST /api/orders/checkout (cartId, addressId)
    activate API

    API->>DB: Query Cart & Verify Variant Stock
    activate DB
    DB-->>API: Stock Validated
    deactivate DB

    API->>DB: BEGIN Transaction: Create Order (Status: PENDING)
    activate DB
    DB-->>API: Order Created (order_101)
    deactivate DB

    API->>Razorpay: orders.create(amount: 4999, currency: "INR")
    activate Razorpay
    Razorpay-->>API: { razorpayOrderId: "order_rzp_99" }
    deactivate Razorpay

    API-->>Frontend: 201 Created { orderId, razorpayOrderId, key }
    deactivate API

    Frontend->>Customer: Render Razorpay Checkout Modal
    Customer->>Razorpay: Submit Card / UPI Details & Complete OTP
    activate Razorpay
    Razorpay-->>Frontend: Callback: { paymentId, signature }
    deactivate Razorpay

    Frontend->>API: POST /api/payments/verify (orderId, paymentId, signature)
    activate API

    API->>API: Crypto HMAC-SHA256 Signature Verification
    alt Signature Valid
        API->>DB: BEGIN Transaction:
        activate DB
        API->>DB: Update Payment (Status: SUCCESS)
        API->>DB: Update Order (Status: CONFIRMED)
        API->>DB: Decrement Variant Stock
        DB-->>API: Transaction Committed
        deactivate DB
        API-->>Frontend: 200 OK { status: "success", receiptUrl }
        Frontend->>Customer: Display Order Confirmation Page
    else Signature Invalid
        API->>DB: Update Payment (Status: FAILED)
        API-->>Frontend: 400 Bad Request { message: "Payment verification failed" }
        Frontend->>Customer: Display Error & Retry Option
    end
    deactivate API
```

---

### 2.5 State Machine Diagram (Order Lifecycle)
Represents the distinct states of an `Order` entity and the triggers driving state transitions.

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT: User creates order
    
    PENDING_PAYMENT --> PAYMENT_FAILED: Payment declined / Timeout
    PAYMENT_FAILED --> PENDING_PAYMENT: User retries payment
    PAYMENT_FAILED --> CANCELLED: Order timeout (15 mins)
    
    PENDING_PAYMENT --> PROCESSING: Payment verified (PAID)
    
    PROCESSING --> PACKED: Admin packs order & assigns SKU
    PROCESSING --> CANCELLED: User requests cancellation (Pre-shipment)
    
    PACKED --> SHIPPED: Carrier pickup (Tracking ID assigned)
    
    SHIPPED --> OUT_FOR_DELIVERY: Local distribution hub dispatched
    SHIPPED --> RETURNED_TO_ORIGIN: Delivery failed 3 times
    
    OUT_FOR_DELIVERY --> DELIVERED: Customer receives order & OTP verified
    
    DELIVERED --> RETURN_REQUESTED: Customer requests return (within 7 days)
    RETURN_REQUESTED --> REFUNDED: Returned item inspected & refund initiated
    RETURN_REQUESTED --> DELIVERED: Return rejected
    
    CANCELLED --> [*]
    DELIVERED --> [*]
    REFUNDED --> [*]
```

---

### 2.6 Component Diagram
Depresents the high-level structural decomposition and interface boundaries of the software subsystems.

```mermaid
flowchart TD
    subgraph FrontendApp ["Storefront & Admin UI (Next.js)"]
        UI_Components["React Components / Radix UI"]
        State_Store["Zustand Client Store (Cart, User)"]
        API_Client["Axios / Fetch HTTP Client"]
        UI_Components --> State_Store
        UI_Components --> API_Client
    end

    subgraph BackendAPI ["REST API Server (Express.js)"]
        AuthModule["Auth Module (JWT & RBAC)"]
        ProductModule["Product & Catalog Module"]
        OrderModule["Order & Checkout Module"]
        PaymentModule["Payment Verification Module"]
        InventoryModule["Inventory Management Module"]
        
        GatewayRouter["Express API Router & Middleware\n(RateLimiter, Helmet, Zod Validator)"]
        
        GatewayRouter --> AuthModule
        GatewayRouter --> ProductModule
        GatewayRouter --> OrderModule
        GatewayRouter --> PaymentModule
        GatewayRouter --> InventoryModule
    end

    subgraph DataAccessLayer ["Persistence & ORM Layer"]
        PrismaClient["Prisma ORM Client"]
        AuthModule --> PrismaClient
        ProductModule --> PrismaClient
        OrderModule --> PrismaClient
        PaymentModule --> PrismaClient
        InventoryModule --> PrismaClient
    end

    subgraph StorageAndInfrastructure ["Cloud Storage & Databases"]
        PostgreSQL[("Neon Serverless PostgreSQL")]
        RedisCache[("Render Redis Cache")]
        R2Storage[("Cloudflare R2 Object Storage")]
    end

    subgraph ThirdPartyAPIs ["External Cloud Services"]
        RazorpayAPI["Razorpay API"]
        EmailService["Nodemailer SMTP"]
    end

    API_Client -->|HTTPS REST| GatewayRouter
    GatewayRouter -->|Rate Limit / Cache| RedisCache
    PrismaClient -->|SQL Connection Pool| PostgreSQL
    ProductModule -->|S3 SDK| R2Storage
    PaymentModule -->|SDK| RazorpayAPI
    OrderModule -->|SMTP| EmailService
```

---

### 2.7 Deployment Diagram
Shows physical node allocation, networking topologies, CDNs, and server environments.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Devices"]
        Browser["User Web Browser / Mobile\n(SPA Bundle - Next.js UI)"]
    end

    subgraph VercelEdge ["Vercel Edge Network (Global CDN)"]
        VercelCDN["Vercel Edge CDN & Serverless Runtime\n(theoutliersstudio.com)"]
        VercelRewrite["API Reverse Proxy / Rewrite Rules (/api/*)"]
        VercelCDN --> VercelRewrite
    end

    subgraph RenderCloud ["Render Cloud PaaS (Node.js Environment)"]
        RenderService["Render Web Service\nExpress REST API Container (:5000)\nPrisma ORM Client Engine"]
        RenderRedis[("Render Redis 7 Instance\nRate Limiter & Session Cache")]
        RenderService <--> RenderRedis
    end

    subgraph NeonCloud ["Neon Database Cloud"]
        NeonDB[("Neon Serverless PostgreSQL 16\nConnection Pooling & Auto-scaling")]
    end

    subgraph CloudflareNetwork ["Cloudflare Network"]
        R2Bucket[("Cloudflare R2 Object Storage\nS3-Compatible CDN Image Store")]
    end

    subgraph ExternalGateways ["External Cloud Services"]
        RazorpayGateway["Razorpay Payment Gateway API"]
        SMTPGateway["SMTP Mail Server (Nodemailer)"]
    end

    Browser -->|HTTPS / Port 443| VercelCDN
    VercelRewrite -->|HTTPS Reverse Proxy| RenderService
    RenderService -->|TCP 5432 / Prisma Pool| NeonDB
    RenderService -->|S3 API / HTTPS| R2Bucket
    RenderService -->|REST HTTPS Webhook| RazorpayGateway
    RenderService -->|SMTP 587| SMTPGateway
```

---

## 3. Software Engineering Tools & Technologies

| Category | Tool / Framework | Purpose & Usage in Project |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 + React 19 | Server-Side Rendering (SSR), App Router, dynamic routing. |
| **Styling & Design** | Tailwind CSS v4 + Radix UI | Responsive styling, design tokens, accessible dialogs/menus. |
| **Backend Framework** | Node.js + Express.js | Modular RESTful API routing, business logic orchestration. |
| **ORM & Database** | Prisma ORM + Neon PostgreSQL | Type-safe schema migrations, queries, and relations. |
| **Caching & Security** | Redis + Helmet + Rate-Limiter | Session caching, distributed rate-limiting, security headers. |
| **Storage & Assets** | Cloudflare R2 | S3-compatible, high-throughput image asset storage. |
| **Version Control & CI/CD** | Git + GitHub + GitHub Actions | Feature branch workflows, linting, automated testing & deployment. |
| **API Testing & Docs** | Postman / Thunder Client | REST endpoint functional testing and contract validation. |
| **UML & Diagrams** | Mermaid.js / Draw.io / PlantUML | System architectural modeling and documentation. |

---

## 4. Project Planning & Management Artifacts

### 4.1 Work Breakdown Structure (WBS)
```
1.0 Tevar E-Commerce System
 ├── 1.1 Requirements & System Architecture
 │    ├── 1.1.1 Problem analysis & SRS documentation
 │    └── 1.1.2 UML structural & behavioral modeling
 ├── 1.2 Frontend Development (Storefront & Admin)
 │    ├── 1.2.1 Design system & responsive layout (Tailwind + Radix)
 │    ├── 1.2.2 Product catalog, search & filtering UI
 │    ├── 1.2.3 Zustand Cart, Wishlist & Checkout flows
 │    └── 1.2.4 Admin dashboard (Analytics, Inventory table)
 ├── 1.3 Backend API & Database
 │    ├── 1.3.1 Prisma schema definition & Neon DB migrations
 │    ├── 1.3.2 JWT Authentication & RBAC middleware
 │    ├── 1.3.3 Products, Categories & Media upload (Cloudflare R2)
 │    └── 1.3.4 Orders, Razorpay webhook & transactional stock decrement
 ├── 1.4 Testing & Quality Assurance
 │    ├── 1.4.1 Unit & integration tests (Supertest + Jest)
 │    ├── 1.4.2 End-to-End checkout validation & payment mocking
 │    └── 1.4.3 Security audits (OWASP Top 10, rate limiting)
 └── 1.5 Deployment & Cloud Infrastructure
      ├── 1.5.1 Vercel Edge frontend setup & API route rewrites
      └── 1.5.2 Render Web Service & Redis instance provisioning
```

---

### 4.2 Gantt Chart (6-Sprint Agile Release Schedule)

```mermaid
gantt
    title E-Commerce Project Implementation Schedule
    dateFormat  YYYY-MM-DD
    section Sprint 1: Architecture & DB
    SRS & UML Design Specification       :done, s1_1, 2026-08-01, 7d
    Prisma Schema & Neon DB Setup        :done, s1_2, after s1_1, 5d
    section Sprint 2: Core Auth & API
    JWT Auth & RBAC Middleware          :done, s2_1, 2026-08-13, 6d
    Product & Category CRUD APIs         :done, s2_2, after s2_1, 6d
    section Sprint 3: Frontend Storefront
    Next.js Layout & Product Catalog UI  :done, s3_1, 2026-08-25, 8d
    Cart & Wishlist (Zustand Store)      :done, s3_2, after s3_1, 5d
    section Sprint 4: Order & Payments
    Checkout Engine & Stock Locking      :active, s4_1, 2026-09-07, 6d
    Razorpay Webhook & Signature Capture :active, s4_2, after s4_1, 5d
    section Sprint 5: Admin & Analytics
    Admin Portal (TanStack Table & Charts): s5_1, 2026-09-18, 7d
    Cloudflare R2 Drag-and-Drop Media    : s5_2, after s5_1, 5d
    section Sprint 6: Testing & Launch
    Integration Testing & Security Audit : s6_1, 2026-09-30, 6d
    Production Deployment (Vercel/Render): s6_2, after s6_1, 4d
```

---

## 5. Testing Artifacts & Quality Assurance

### 5.1 Test Cases Specification

| Test ID | Module / Feature | Test Description | Input Data | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Authentication | Register user with existing email | `{ email: "existing@brand.com" }` | `409 Conflict`, "Email already in use" | **PASS** |
| **TC-02** | Catalog | Filter products by non-existent size | `GET /api/products?size=XXXXL` | `200 OK`, `products: []` | **PASS** |
| **TC-03** | Inventory | Checkout item when stock is 0 | Variant Qty = 1, Stock = 0 | `400 Bad Request`, "Out of stock" | **PASS** |
| **TC-04** | Payment | Webhook with altered signature | Tampered Razorpay payload | `400 Bad Request`, Signature invalid | **PASS** |
| **TC-05** | Security | Rate limiting trigger | > 100 requests in 1 minute | `429 Too Many Requests` | **PASS** |

### 5.2 Bug Report Sample

* **Bug ID:** `BUG-2026-084`
* **Module:** `Orders / Stock Reservation`
* **Severity:** `High` | **Priority:** `P1`
* **Summary:** Concurrency race condition allowed double-decrement of inventory during simultaneous checkout.
* **Steps to Reproduce:**
  1. Open two browser sessions with 1 item remaining in stock.
  2. Click "Pay" simultaneously in both sessions.
* **Root Cause:** Missing database transaction locking during stock validation.
* **Resolution:** Wrapped order creation and variant decrement in `prisma.$transaction([ ... ])`.

---

## 6. GitHub Repository & Version Control Strategy

* **Git Flow Strategy:**
  * `main`: Production-ready release code. Automatic deploy to Vercel/Render production environments.
  * `develop`: Integration branch for finished sprint features.
  * `feature/*` (`feature/razorpay-integration`): Feature-specific development branches.
  * `hotfix/*`: Direct fixes for production issues.
* **Commit Message Standard:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
* **Branch Protection Rules:** Require pull request reviews, passing GitHub Actions CI build checks before merging.

---

## 7. Viva & Practical Presentation Q&A

**Q1: Why did you choose a decoupled architecture (Next.js on Vercel + Express on Render) instead of Next.js fullstack API routes?**  
> *Answer:* Decoupling separates concerns: the frontend benefits from global edge CDN caching and fast SSR on Vercel, while the backend maintains long-lived TCP connection pools to Neon PostgreSQL and Redis without serverless cold starts or timeout limits on background jobs.

**Q2: How do you handle race conditions during inventory checkout?**  
> *Answer:* We employ Prisma ACID interactive transactions (`prisma.$transaction`). The stock quantity is conditionally verified and decremented atomically. If stock is insufficient at the moment of execution, the entire transaction rolls back.

**Q3: How does the system ensure payment security?**  
> *Answer:* The backend computes an HMAC-SHA256 hash using the secret key, `razorpay_order_id`, and `razorpay_payment_id`, comparing it against the received signature before marking the order as confirmed and releasing the digital invoice.
