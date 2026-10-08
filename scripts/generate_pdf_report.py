import os
import subprocess
import time

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Practical 3: UML Design for an E-Commerce System</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
    mermaid.initialize({
        startOnLoad: true,
        theme: 'neutral',
        themeVariables: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            primaryColor: '#f1f5f9',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#0284c7',
            lineColor: '#0284c7',
            secondaryColor: '#e0f2fe',
            tertiaryColor: '#ffffff'
        },
        flowchart: { curve: 'basis', htmlLabels: true },
        securityLevel: 'loose'
    });
</script>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
        --primary: #0284c7;
        --primary-dark: #0369a1;
        --slate-900: #0f172a;
        --slate-800: #1e293b;
        --slate-700: #334155;
        --slate-600: #475569;
        --slate-200: #e2e8f0;
        --slate-100: #f1f5f9;
        --slate-50: #f8fafc;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: var(--slate-800);
        background: #fdfdfd;
        line-height: 1.6;
        font-size: 13.5px;
        padding: 40px;
        max-width: 1100px;
        margin: 0 auto;
    }

    /* Cover / Title Header */
    .title-banner {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%);
        color: #ffffff;
        padding: 40px;
        border-radius: 12px;
        margin-bottom: 35px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
    }

    .title-banner .badge {
        display: inline-block;
        background: rgba(2, 132, 199, 0.4);
        border: 1px solid rgba(56, 189, 248, 0.5);
        color: #e0f2fe;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 9999px;
        margin-bottom: 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .title-banner h1 {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        color: #ffffff;
    }

    .title-banner p {
        font-size: 14px;
        color: #cbd5e1;
        max-width: 800px;
    }

    .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        font-size: 12px;
    }

    .meta-grid span {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .meta-grid strong {
        color: #ffffff;
        font-size: 13px;
    }

    /* Section Headings */
    h2 {
        font-size: 20px;
        font-weight: 700;
        color: var(--slate-900);
        margin: 40px 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--slate-200);
        display: flex;
        align-items: center;
        gap: 10px;
    }

    h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-dark);
        margin: 25px 0 10px 0;
    }

    p {
        margin-bottom: 12px;
        color: var(--slate-700);
    }

    /* Card & Container */
    .card {
        background: #ffffff;
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    }

    .diagram-container {
        background: #ffffff;
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 24px;
        margin: 18px 0 28px 0;
        text-align: center;
        overflow-x: auto;
    }

    .diagram-caption {
        font-size: 12px;
        font-weight: 600;
        color: var(--slate-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 14px;
        padding-top: 10px;
        border-top: 1px dashed var(--slate-200);
    }

    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0 25px 0;
        font-size: 12.5px;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--slate-200);
    }

    th {
        background: var(--slate-100);
        color: var(--slate-900);
        text-align: left;
        padding: 10px 14px;
        font-weight: 600;
        border-bottom: 1px solid var(--slate-200);
    }

    td {
        padding: 9px 14px;
        border-bottom: 1px solid var(--slate-200);
        color: var(--slate-700);
        vertical-align: top;
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:nth-child(even) {
        background-color: var(--slate-50);
    }

    /* Code & Badges */
    code, pre {
        font-family: 'JetBrains Mono', monospace;
    }

    code {
        background: var(--slate-100);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: #0369a1;
    }

    pre {
        background: var(--slate-900);
        color: #f8fafc;
        padding: 16px;
        border-radius: 8px;
        font-size: 11.5px;
        line-height: 1.5;
        overflow-x: auto;
        margin: 12px 0 20px 0;
    }

    ul, ol {
        margin: 10px 0 15px 24px;
        color: var(--slate-700);
    }

    li {
        margin-bottom: 6px;
    }

    .badge-success {
        background: #dcfce7;
        color: #15803d;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 11px;
    }

    .callout {
        background: #eff6ff;
        border-left: 4px solid var(--primary);
        padding: 14px 18px;
        border-radius: 0 8px 8px 0;
        margin: 15px 0;
    }

    .callout p {
        margin: 0;
        color: #1e40af;
        font-size: 13px;
    }

    /* Page Breaks for Print */
    @media print {
        body {
            padding: 15mm 15mm;
            background: #ffffff;
            font-size: 11.5px;
        }
        .title-banner {
            box-shadow: none;
            padding: 25px;
        }
        .page-break {
            page-break-before: always;
            break-before: page;
        }
        .diagram-container, table, .card {
            page-break-inside: avoid;
            break-inside: avoid;
        }
    }
</style>
</head>
<body>

<div class="title-banner">
    <div class="badge">Practical 3 Deliverable</div>
    <h1>UML Design & Software Architecture Report</h1>
    <p>Comprehensive System Modeling, Architectural Diagrams, SRS, and Engineering Artifacts for the Tevar E-Commerce Platform.</p>
    
    <div class="meta-grid">
        <div><span>Project</span><strong>Tevar Fashion</strong></div>
        <div><span>Subject</span><strong>Software Engineering Lab</strong></div>
        <div><span>Topology</span><strong>Next.js + Express + Neon DB</strong></div>
        <div><span>Status</span><strong>Production Grade</strong></div>
    </div>
</div>

<h2>1. Problem Analysis & Requirement Gathering (SRS)</h2>
<div class="card">
    <p><strong>1.1 Problem Statement:</strong> Modern fashion e-commerce demands high-availability browsing, instant inventory reservation, secure multi-channel payments, and granular administrative control. Monolithic architectures suffer from performance bottlenecks during flash sales, tight coupling between catalog and order management, and fragile state synchronization.</p>
    
    <p><strong>1.2 Core System Objectives:</strong></p>
    <ul>
        <li><strong>Micro-Modular Decoupled Architecture:</strong> Decouple storefront UI (Next.js/Vercel) from core business logic (Express REST API on Render).</li>
        <li><strong>ACID Transaction Integrity:</strong> Guarantee atomic state changes across order creation, inventory stock deduction, and Razorpay webhook capture.</li>
        <li><strong>Low-Latency Catalog & Media CDN:</strong> Zero-egress Cloudflare R2 object storage with Redis-backed rate limiting and session caching.</li>
        <li><strong>Role-Based Access Control (RBAC):</strong> Granular privileges for <code>CUSTOMER</code>, <code>ADMIN</code>, and <code>SUPER_ADMIN</code> roles.</li>
    </ul>
</div>

<h3>1.3 Functional Requirements (FR)</h3>
<table>
    <thead>
        <tr><th>ID</th><th>Requirement Name</th><th>Description</th><th>Actors</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>FR-01</strong></td><td>User Auth & Profile</td><td>JWT dual-token auth (Access 15m + Refresh 7d), Bcrypt hashing, address book management.</td><td>Customer, Admin</td></tr>
        <tr><td><strong>FR-02</strong></td><td>Catalog Browsing & Search</td><td>Multi-facet product filtering (category, size, color, price) and full-text keyword search.</td><td>Customer, Guest</td></tr>
        <tr><td><strong>FR-03</strong></td><td>Cart & Wishlist</td><td>Real-time cart sync, quantity modification, and persistent session storage.</td><td>Customer</td></tr>
        <tr><td><strong>FR-04</strong></td><td>Order & Checkout Engine</td><td>Multi-item order calculation, automated tax/coupon evaluation, and stock reservation.</td><td>Customer, System</td></tr>
        <tr><td><strong>FR-05</strong></td><td>Payment Gateway Integration</td><td>Razorpay order creation, client modal checkout, and HMAC-SHA256 signature verification.</td><td>Customer, Razorpay</td></tr>
        <tr><td><strong>FR-06</strong></td><td>Inventory Control</td><td>Atomic decrement on payment success; auto-restocking on payment failure or timeout.</td><td>System, Admin</td></tr>
        <tr><td><strong>FR-07</strong></td><td>Admin & Operations</td><td>Real-time sales dashboard, SKU management, order shipment fulfillment tracking.</td><td>Admin, Super Admin</td></tr>
    </tbody>
</table>

<div class="page-break"></div>

<h2>2. UML Diagrams & Structural Modeling</h2>

<h3>2.1 Use Case Diagram</h3>
<p>Defines functional requirements and actor interaction boundaries for Storefront and Admin subsystems.</p>

<div class="diagram-container">
<pre class="mermaid">
flowchart LR
    Customer(("Customer / User"))
    Admin(("Store Admin"))
    Razorpay(("Razorpay Gateway"))
    MailService(("SMTP Mailer"))

    subgraph System ["Tevar E-Commerce System Boundary"]
        UC1(["Authenticate (Login/Register)"])
        UC2(["Browse & Filter Catalog"])
        UC3(["Manage Cart & Wishlist"])
        UC4(["Checkout & Place Order"])
        UC5(["Process Payment (Razorpay)"])
        UC6(["Track Order Lifecycle"])
        UC7(["Manage Products & SKU Stock"])
        UC8(["Update Order Fulfillment"])
        UC9(["View Sales & Revenue Analytics"])
        UC10(["Send Email Receipt"])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC6

    UC4 -.->|includes| UC5
    UC5 -.->|includes| UC10
    UC5 --- Razorpay
    UC10 --- MailService

    Admin --> UC1
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
</pre>
<div class="diagram-caption">Figure 2.1 — Use Case Diagram for Tevar E-Commerce System</div>
</div>

<div class="page-break"></div>

<h3>2.2 Class Diagram (Domain & Entity Model)</h3>
<p>Represents the core data structures, properties, relationships, and service methods implemented in Prisma ORM.</p>

<div class="diagram-container">
<pre class="mermaid">
classDiagram
    class User {
        +String id
        +String email
        +String passwordHash
        +String role
        +String firstName
        +String lastName
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
        +Boolean isDefault
    }

    class Product {
        +String id
        +String title
        +String slug
        +Decimal price
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
    }

    class Order {
        +String id
        +String orderNumber
        +String userId
        +Decimal totalAmount
        +String orderStatus
        +String paymentStatus
        +createOrder()
        +cancelOrder()
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
        +String status
        +verifySignature()
    }

    User "1" *-- "0..*" Address : has
    User "1" -- "0..1" Cart : owns
    User "1" -- "0..*" Order : places
    Cart "1" *-- "0..*" CartItem : contains
    Product "1" *-- "1..*" ProductVariant : has
    ProductVariant "1" -- "0..*" CartItem : references
    Order "1" *-- "1..*" OrderItem : contains
    Order "1" -- "1" Payment : settled_by
</pre>
<div class="diagram-caption">Figure 2.2 — System Class Diagram (Domain Model & Associations)</div>
</div>

<div class="page-break"></div>

<h3>2.3 Activity Diagram (Order Checkout & Payment Workflow)</h3>
<p>Details the end-to-end decision logic, stock verification, and branching paths during customer checkout.</p>

<div class="diagram-container">
<pre class="mermaid">
flowchart TD
    Start([User Initiates Checkout]) --> CheckAuth{Is Authenticated?}
    CheckAuth -- No --> PromptLogin[Prompt Login / Registration]
    PromptLogin --> CheckAuth
    CheckAuth -- Yes --> SelectAddr[Select Delivery Address]
    
    SelectAddr --> ValidateStock{Verify Stock for all items?}
    ValidateStock -- Insufficient --> OutOfStock[Display Stock Error & Update Cart]
    OutOfStock --> EndFail([End Flow])
    
    ValidateStock -- Sufficient --> CreatePending[Create Order: Status PENDING]
    CreatePending --> LockStock[Lock Variant Inventory]
    LockStock --> GenRazorpay[Generate Razorpay Order ID]
    
    GenRazorpay --> LaunchModal[Open Razorpay Payment Gateway Modal]
    LaunchModal --> UserAction{Payment Completed?}
    
    UserAction -- Cancelled/Timeout --> ReleaseStock[Release Locked Inventory]
    ReleaseStock --> MarkFailed[Mark Order: PAYMENT_FAILED]
    MarkFailed --> EndFail
    
    UserAction -- Success --> VerifyHMAC{HMAC Signature Valid?}
    VerifyHMAC -- Invalid --> SecurityAlert[Log Security Warning]
    SecurityAlert --> MarkFailed
    
    VerifyHMAC -- Valid --> CommitDB[Commit Transaction: Stock Decrement]
    CommitDB --> MarkPaid[Mark Order: CONFIRMED & PAID]
    MarkPaid --> SendReceipt[Send Email & Push Notification]
    SendReceipt --> ShowSuccess[Display Order Confirmation Page]
    ShowSuccess --> EndSuccess([Order Complete])
</pre>
<div class="diagram-caption">Figure 2.3 — Activity Diagram for Checkout & Stock Reservation Flow</div>
</div>

<div class="page-break"></div>

<h3>2.4 Sequence Diagram (Checkout & Webhook Verification)</h3>
<p>Models the chronological message flow across the client browser, Express backend, Razorpay gateway, and Neon PostgreSQL database.</p>

<div class="diagram-container">
<pre class="mermaid">
sequenceDiagram
    autonumber
    actor Customer as Customer (Browser)
    participant NextJS as Storefront (Next.js)
    participant Express as Backend API (Express)
    participant DB as Neon DB (Postgres)
    participant RZP as Razorpay Gateway

    Customer->>NextJS: Click "Place Order & Pay"
    NextJS->>Express: POST /api/orders/checkout { cartId, addressId }
    activate Express
    Express->>DB: Query Cart & Check Variant Stock
    DB-->>Express: Stock Available
    Express->>DB: INSERT INTO Order (Status: PENDING)
    DB-->>Express: Order #1049 Created
    Express->>RZP: orders.create(amount: 4999, currency: "INR")
    RZP-->>Express: { razorpayOrderId: "order_k29df9" }
    Express-->>NextJS: 201 Created { orderId, razorpayOrderId, key }
    deactivate Express

    NextJS->>Customer: Render Razorpay Modal
    Customer->>RZP: Authenticate & Pay (UPI / Card / OTP)
    RZP-->>NextJS: Payment Callback { paymentId, signature }
    NextJS->>Express: POST /api/payments/verify { orderId, paymentId, signature }
    activate Express
    Express->>Express: Verify HMAC-SHA256 Signature
    
    alt Signature Valid
        Express->>DB: BEGIN Transaction: Set Status PAID + Decrement Stock
        DB-->>Express: Commit OK
        Express-->>NextJS: 200 OK { success: true }
        NextJS->>Customer: Display Order Confirmation Page
    else Signature Invalid
        Express->>DB: Set Order Status PAYMENT_FAILED
        Express-->>NextJS: 400 Bad Request { error: "Invalid Signature" }
        NextJS->>Customer: Display Error Notification
    end
    deactivate Express
</pre>
<div class="diagram-caption">Figure 2.4 — Sequence Diagram for Checkout & Razorpay Signature Verification</div>
</div>

<div class="page-break"></div>

<h3>2.5 State Machine Diagram (Order Lifecycle)</h3>
<p>Illustrates state transitions, triggers, and terminating states for an order from placement to delivery.</p>

<div class="diagram-container">
<pre class="mermaid">
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Checkout initiated
    
    PENDING_PAYMENT --> PAYMENT_FAILED : Payment timeout / declined
    PAYMENT_FAILED --> PENDING_PAYMENT : User retries payment
    PAYMENT_FAILED --> CANCELLED : Timeout expires (15m)
    
    PENDING_PAYMENT --> PROCESSING : Payment verified (PAID)
    
    PROCESSING --> PACKED : Admin assigns SKU & packs
    PROCESSING --> CANCELLED : Customer cancellation
    
    PACKED --> SHIPPED : Carrier pickup & tracking ID assigned
    SHIPPED --> OUT_FOR_DELIVERY : Reached local distribution hub
    SHIPPED --> RETURNED_TO_ORIGIN : 3 failed delivery attempts
    
    OUT_FOR_DELIVERY --> DELIVERED : Customer OTP verification
    
    DELIVERED --> RETURN_REQUESTED : Return initiated within 7 days
    RETURN_REQUESTED --> REFUNDED : Inspection passed & funds credited
    RETURN_REQUESTED --> DELIVERED : Return inspection rejected
    
    CANCELLED --> [*]
    DELIVERED --> [*]
    REFUNDED --> [*]
</pre>
<div class="diagram-caption">Figure 2.5 — State Machine Diagram for Order Lifecycle</div>
</div>

<div class="page-break"></div>

<h3>2.6 Component Diagram</h3>
<p>Modular structural decomposition showing component interfaces, dependencies, and caching boundaries.</p>

<div class="diagram-container">
<pre class="mermaid">
flowchart TB
    subgraph UI_Layer ["Frontend Client (Next.js 16)"]
        Components["Radix UI & Tailwind Components"]
        ZustandStore["Zustand Client Store (Cart/Auth)"]
        HTTPClient["Axios REST Client"]
        Components --> ZustandStore
        Components --> HTTPClient
    end

    subgraph API_Layer ["API Gateway & Controller Layer (Express.js)"]
        Middleware["Security Middleware (Helmet, CORS, Rate-Limiter)"]
        AuthMod["Auth & RBAC Module"]
        ProdMod["Product & Catalog Module"]
        OrderMod["Order & Checkout Engine"]
        PayMod["Payment & Webhook Module"]
        
        Middleware --> AuthMod
        Middleware --> ProdMod
        Middleware --> OrderMod
        Middleware --> PayMod
    end

    subgraph Data_Layer ["Persistence & Cache Layer"]
        PrismaORM["Prisma ORM Client Engine"]
        RedisCache[("Render Redis Cache (LRU)")]
        NeonPostgres[("Neon Serverless PostgreSQL")]
        R2CDN[("Cloudflare R2 Object Storage")]
    end

    HTTPClient -->|HTTPS REST| Middleware
    AuthMod --> PrismaORM
    ProdMod --> PrismaORM
    OrderMod --> PrismaORM
    PayMod --> PrismaORM
    Middleware <--> RedisCache
    PrismaORM <-->|Connection Pool| NeonPostgres
    ProdMod <-->|S3 SDK| R2CDN
</pre>
<div class="diagram-caption">Figure 2.6 — System Component Diagram</div>
</div>

<div class="page-break"></div>

<h3>2.7 Deployment Diagram</h3>
<p>Physical deployment topology including global CDNs, cloud containers, databases, and third-party payment gateways.</p>

<div class="diagram-container">
<pre class="mermaid">
flowchart TB
    subgraph ClientDevice ["User Client Node"]
        Browser["Desktop & Mobile Web Browser\n(SPA Bundle - React 19 / HTML5)"]
    end

    subgraph VercelNode ["Vercel Edge Global Network"]
        VercelEdge["Vercel CDN Edge Router\n(theoutliersstudio.com)\nNext.js SSR & Route Rewrites"]
    end

    subgraph RenderNode ["Render PaaS (US-East Cloud)"]
        ExpressApp["Docker Web Service\nNode.js 20 LTS Runtime\nExpress REST API Server (:5000)"]
        RedisNode[("Render Redis 7 Managed Instance\nRate Limiting & Token Cache")]
        ExpressApp <--> RedisNode
    end

    subgraph DataNode ["Cloud Database & Storage"]
        NeonDB[("Neon Serverless PostgreSQL 16\nAutoscaling Connection Pool")]
        R2Store[("Cloudflare R2 Object Storage\nZero-Egress Image CDN")]
    end

    subgraph ThirdPartyNode ["External SaaS Infrastructure"]
        RazorpaySaaS["Razorpay Payment Gateway API"]
        SMTPServer["SMTP Mail Server (Nodemailer)"]
    end

    Browser -->|HTTPS 443 / TLS 1.3| VercelEdge
    VercelEdge -->|Reverse Proxy /api/*| ExpressApp
    ExpressApp -->|TCP 5432 / TLS| NeonDB
    ExpressApp -->|S3 HTTPS API| R2Store
    ExpressApp -->|HTTPS Webhook / REST| RazorpaySaaS
    ExpressApp -->|SMTP 587| SMTPServer
</pre>
<div class="diagram-caption">Figure 2.7 — Deployment Diagram (Physical Infrastructure Topology)</div>
</div>

<div class="page-break"></div>

<h2>3. Software Engineering Tools & Technologies</h2>
<table>
    <thead>
        <tr><th>Tool / Framework</th><th>Role in System</th><th>Engineering Rationale</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>Next.js 16 + React 19</strong></td><td>Frontend Application</td><td>App router, server-side rendering for optimal SEO, and instant client-side navigation.</td></tr>
        <tr><td><strong>Node.js + Express.js</strong></td><td>Backend REST API</td><td>Asynchronous non-blocking I/O architecture ideal for high-throughput e-commerce workloads.</td></tr>
        <tr><td><strong>Prisma ORM</strong></td><td>Data Access Layer</td><td>Auto-generated type-safe queries, migration control, and transactional guarantees.</td></tr>
        <tr><td><strong>Neon DB (PostgreSQL 16)</strong></td><td>Primary Database</td><td>Serverless PostgreSQL with instant compute branching, auto-scaling, and pooled connections.</td></tr>
        <tr><td><strong>Render Redis</strong></td><td>In-Memory Cache</td><td>LRU rate-limiting engine (<code>rate-limit-redis</code>) preventing DDoS and brute-force attacks.</td></tr>
        <tr><td><strong>Cloudflare R2</strong></td><td>Media Storage</td><td>S3-compatible bucket eliminating expensive data egress fees for high-resolution product media.</td></tr>
        <tr><td><strong>Razorpay API</strong></td><td>Payment Gateway</td><td>PCI-DSS compliant payment processing supporting UPI, credit/debit cards, and net banking.</td></tr>
        <tr><td><strong>Git & GitHub</strong></td><td>Version Control & CI</td><td>Branch protection rules, pull request audits, and automated lint/test workflows.</td></tr>
    </tbody>
</table>

<h2>4. Project Planning & Agile Artifacts</h2>

<h3>4.1 Work Breakdown Structure (WBS)</h3>
<pre>
1.0 Tevar E-Commerce System
 ├── 1.1 Requirements & System Architecture
 │    ├── 1.1.1 Problem analysis & SRS documentation
 │    └── 1.1.2 UML structural & behavioral modeling
 ├── 1.2 Frontend Storefront & Admin Portal
 │    ├── 1.2.1 Tailwind CSS design tokens & responsive components
 │    ├── 1.2.2 Product catalog, search & filtering UI
 │    ├── 1.2.3 Zustand Cart, Wishlist & Checkout flows
 │    └── 1.2.4 Admin dashboard (TanStack Table & Analytics charts)
 ├── 1.3 Backend REST API & Database
 │    ├── 1.3.1 Prisma schema definition & Neon DB migrations
 │    ├── 1.3.2 JWT Authentication & RBAC middleware
 │    ├── 1.3.3 Products, Categories & Cloudflare R2 media upload
 │    └── 1.3.4 Orders, Razorpay webhook & transactional stock decrement
 ├── 1.4 Testing & Quality Assurance
 │    ├── 1.4.1 Unit & integration tests (Supertest + Jest)
 │    ├── 1.4.2 End-to-End checkout validation & payment mocking
 │    └── 1.4.3 Security audits (OWASP Top 10, rate limiting)
 └── 1.5 Cloud Deployment & CI/CD
      ├── 1.5.1 Vercel Edge frontend setup & API route rewrites
      └── 1.5.2 Render Web Service & Redis instance provisioning
</pre>

<div class="page-break"></div>

<h2>5. Testing Artifacts & Quality Assurance</h2>

<h3>5.1 Test Cases Specification</h3>
<table>
    <thead>
        <tr><th>Test ID</th><th>Module</th><th>Test Description</th><th>Input Payload</th><th>Expected Result</th><th>Status</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>TC-01</strong></td><td>Auth</td><td>Duplicate email registration</td><td><code>{ email: "user@brand.com" }</code></td><td><code>409 Conflict</code> (User already exists)</td><td><span class="badge-success">PASS</span></td></tr>
        <tr><td><strong>TC-02</strong></td><td>Catalog</td><td>Filter by non-existent size</td><td><code>GET /api/products?size=XXXXL</code></td><td><code>200 OK</code>, <code>products: []</code></td><td><span class="badge-success">PASS</span></td></tr>
        <tr><td><strong>TC-03</strong></td><td>Inventory</td><td>Checkout item when stock is 0</td><td><code>variantId: 44, qty: 1</code> (Stock: 0)</td><td><code>400 Bad Request</code> (Insufficient stock)</td><td><span class="badge-success">PASS</span></td></tr>
        <tr><td><strong>TC-04</strong></td><td>Payment</td><td>Webhook with tampered signature</td><td>Altered HMAC payload</td><td><code>400 Bad Request</code> (Invalid signature)</td><td><span class="badge-success">PASS</span></td></tr>
        <tr><td><strong>TC-05</strong></td><td>Security</td><td>Rate limit threshold trigger</td><td>120 requests in 60s from 1 IP</td><td><code>429 Too Many Requests</code></td><td><span class="badge-success">PASS</span></td></tr>
    </tbody>
</table>

<h3>5.2 Bug Report Sample</h3>
<div class="card">
    <p><strong>Bug ID:</strong> <code>BUG-2026-084</code> &nbsp;|&nbsp; <strong>Severity:</strong> <span style="color:#b91c1c; font-weight:600;">High</span> &nbsp;|&nbsp; <strong>Priority:</strong> P1</p>
    <p><strong>Summary:</strong> Concurrency race condition allowed duplicate stock deduction during simultaneous checkout clicks.</p>
    <p><strong>Steps to Reproduce:</strong> Open two browser tabs with 1 unit remaining in stock. Click "Pay" simultaneously.</p>
    <p><strong>Root Cause:</strong> Lack of atomic locking between stock read and decrement operations in standard database queries.</p>
    <p><strong>Resolution:</strong> Encapsulated stock validation and quantity update inside a Prisma interactive transaction (<code>prisma.$transaction</code>).</p>
</div>

<h2>6. Viva & Presentation Questions</h2>
<div class="callout">
    <p><strong>Q1: Why separate the frontend on Vercel from the backend on Render instead of a Next.js fullstack monolith?</strong></p>
    <p style="margin-top:6px; color:#334155;"><em>Answer:</em> Decoupling allows the storefront to benefit from global Vercel Edge caching and static optimization, while the backend maintains long-lived TCP connection pools to PostgreSQL and Redis without serverless cold starts or strict timeout limits.</p>
</div>

<div class="callout">
    <p><strong>Q2: How does the system prevent payment fraud during checkout?</strong></p>
    <p style="margin-top:6px; color:#334155;"><em>Answer:</em> The server computes an HMAC-SHA256 hash using the private secret key, <code>razorpay_order_id</code>, and <code>razorpay_payment_id</code>, validating it against the received signature before committing the order to the database.</p>
</div>

</body>
</html>
"""

html_path = "/Users/bankimkamila/Tevar/docs/PRACTICAL_3_UML_DESIGN_DOCUMENT.html"
pdf_path = "/Users/bankimkamila/Tevar/docs/PRACTICAL_3_UML_DESIGN_DOCUMENT.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_path}")

# Run headless chrome to convert HTML to PDF with delay for mermaid rendering
chrome_binary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cmd = [
    chrome_binary,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=8000",
    f"--print-to-pdf={pdf_path}",
    f"file://{html_path}"
]

print("Compiling PDF with Headless Chrome...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome stdout:", res.stdout)
print("Chrome stderr:", res.stderr)

if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
    print(f"SUCCESS: PDF successfully generated at {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
else:
    print("PDF generation failed or file is empty.")
