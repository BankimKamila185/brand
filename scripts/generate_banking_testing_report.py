import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Practical 4: Software Testing for an Online Banking System</title>
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
        font-size: 13px;
        padding: 40px;
        max-width: 1100px;
        margin: 0 auto;
    }

    /* Cover / Title Header */
    .title-banner {
        background: linear-gradient(135deg, #091e3a 0%, #1e293b 50%, #0369a1 100%);
        color: #ffffff;
        padding: 40px;
        border-radius: 12px;
        margin-bottom: 35px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
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
        font-size: 27px;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        color: #ffffff;
    }

    .title-banner p {
        font-size: 13.5px;
        color: #cbd5e1;
        max-width: 850px;
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

    /* Headings */
    h2 {
        font-size: 19px;
        font-weight: 700;
        color: var(--slate-900);
        margin: 35px 0 14px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--slate-200);
    }

    h3 {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-dark);
        margin: 22px 0 10px 0;
    }

    p {
        margin-bottom: 12px;
        color: var(--slate-700);
    }

    /* Cards & Containers */
    .card {
        background: #ffffff;
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 18px 22px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    }

    .diagram-container {
        background: #ffffff;
        border: 1px solid var(--slate-200);
        border-radius: 10px;
        padding: 20px;
        margin: 16px 0 24px 0;
        text-align: center;
        overflow-x: auto;
    }

    .diagram-caption {
        font-size: 11.5px;
        font-weight: 600;
        color: var(--slate-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px dashed var(--slate-200);
    }

    /* Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0 22px 0;
        font-size: 12px;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--slate-200);
    }

    th {
        background: var(--slate-100);
        color: var(--slate-900);
        text-align: left;
        padding: 9px 12px;
        font-weight: 600;
        border-bottom: 1px solid var(--slate-200);
    }

    td {
        padding: 8px 12px;
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

    /* Code */
    code, pre {
        font-family: 'JetBrains Mono', monospace;
    }

    code {
        background: var(--slate-100);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11.5px;
        color: #0369a1;
    }

    pre {
        background: var(--slate-900);
        color: #f8fafc;
        padding: 14px;
        border-radius: 8px;
        font-size: 11.5px;
        line-height: 1.5;
        overflow-x: auto;
        margin: 10px 0 16px 0;
    }

    ul, ol {
        margin: 8px 0 12px 22px;
        color: var(--slate-700);
    }

    li {
        margin-bottom: 5px;
    }

    .badge-pass {
        background: #dcfce7;
        color: #15803d;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 11px;
    }

    .badge-fail {
        background: #fee2e2;
        color: #b91c1c;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 11px;
    }

    .callout {
        background: #eff6ff;
        border-left: 4px solid var(--primary);
        padding: 12px 16px;
        border-radius: 0 8px 8px 0;
        margin: 14px 0;
    }

    .callout p {
        margin: 0;
        color: #1e40af;
        font-size: 12.5px;
    }

    @media print {
        body {
            padding: 12mm 12mm;
            background: #ffffff;
            font-size: 11px;
        }
        .title-banner {
            box-shadow: none;
            padding: 22px;
        }
        .page-break {
            page-break-before: always;
            break-before: page;
        }
        .diagram-container, table, .card, pre {
            page-break-inside: avoid;
            break-inside: avoid;
        }
    }
</style>
</head>
<body>

<div class="title-banner">
    <div class="badge">Practical 4 Comprehensive Submission</div>
    <h1>Testing an Online Banking System</h1>
    <p>Complete Software Testing Life Cycle (STLC) Documentation: Test Plan (IEEE 829), Boundary Value Analysis, Equivalence Partitioning, White Box & Control Flow Graph Analysis, Test Cases, Bug Reports, and Regression Metrics.</p>
    
    <div class="meta-grid">
        <div><span>Domain</span><strong>Online Banking & Core Banking</strong></div>
        <div><span>Methodology</span><strong>Black Box & White Box Testing</strong></div>
        <div><span>Standards</span><strong>IEEE 829 / IEEE 1044 / OWASP</strong></div>
        <div><span>Status</span><strong>Verified & Complete</strong></div>
    </div>
</div>

<h2>1. Problem Analysis & Requirement Gathering (SRS Summary)</h2>
<div class="card">
    <p><strong>1.1 Problem Statement:</strong> Online Banking Systems handle critical financial assets and confidential user data. Defects such as concurrency race conditions (double-spending), unauthorized account access, floating-point rounding errors, and unhandled transaction timeouts can result in severe financial losses, compliance breaches, and regulatory penalties. Rigorous verification across black-box and white-box testing methodologies is mandatory.</p>
    
    <p><strong>1.2 Scope of Tested Modules:</strong></p>
    <ul>
        <li><strong>Module 1: User Authentication & Multi-Factor Auth (MFA):</strong> Customer ID/Password login, SMS/Email OTP validation, account lockout after 3 failed attempts.</li>
        <li><strong>Module 2: Fund Transfer System (NEFT / RTGS / IMPS):</strong> Inter-bank and intra-bank transfers, daily limits, beneficiary cooling period, double-entry ledger deduction.</li>
        <li><strong>Module 3: Account Balance & Statement Services:</strong> Real-time available vs ledger balance computation, interest application, transaction history filtering.</li>
        <li><strong>Module 4: Fixed Deposit & Loan Calculation:</strong> Principal, tenure, and compound interest calculations with strict boundary limits.</li>
    </ul>
</div>

<h3>1.3 Core Banking Architectural Modeling</h3>
<div class="diagram-container">
<pre class="mermaid">
flowchart LR
    Customer(("Bank Customer"))
    Admin(("Branch Officer / Auditor"))

    subgraph BankingSystem ["Core Online Banking Platform"]
        AuthService["Auth & 2FA Service"]
        TransferService["Fund Transfer Engine"]
        LedgerService["Double-Entry Ledger"]
        AccountService["Account & Balance Service"]
        FraudEngine["Fraud & Risk Detection"]
    end

    Customer -->|HTTPS / TLS 1.3| AuthService
    Customer -->|Initiate Transfer| TransferService
    Customer -->|Query Balance| AccountService

    TransferService --> FraudEngine
    FraudEngine -->|Approved| LedgerService
    LedgerService -->|Debit/Credit DB Transaction| AccountService

    Admin -->|Audit Logs & Lockouts| AuthService
</pre>
<div class="diagram-caption">Figure 1.1 — Online Banking High-Level Architectural Context</div>
</div>

<div class="page-break"></div>

<h2>2. Black Box Testing Techniques</h2>

<h3>2.1 Equivalence Class Partitioning (ECP)</h3>
<p>ECP divides the input domain into valid and invalid partitions such that test cases from each partition represent the entire class.</p>

<table>
    <thead>
        <tr><th>Feature / Input Field</th><th>Valid Equivalence Class (VEC)</th><th>Invalid Equivalence Class (IEC)</th></tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Transfer Amount (₹)</strong><br>Min: ₹1.00, Max: ₹500,000.00</td>
            <td><code>V1: 1.00 &le; Amount &le; 500,000.00</code></td>
            <td><code>I1: Amount &lt; 1.00 (Zero / Negative)</code><br><code>I2: Amount &gt; 500,000.00 (Exceeds Limit)</code><br><code>I3: Non-numeric / Special characters</code></td>
        </tr>
        <tr>
            <td><strong>User Password</strong><br>8-16 chars, 1 uppercase, 1 special char, 1 digit</td>
            <td><code>V2: 8 to 16 chars with compliant complexity (e.g. Bank@2026)</code></td>
            <td><code>I4: Length &lt; 8 chars</code><br><code>I5: Length &gt; 16 chars</code><br><code>I6: Missing special char or digit</code></td>
        </tr>
        <tr>
            <td><strong>One-Time Password (OTP)</strong><br>Exact 6-digit numeric</td>
            <td><code>V3: Exactly 6 numeric digits (e.g. 583921)</code></td>
            <td><code>I7: &lt; 6 digits (e.g. 1234)</code><br><code>I8: &gt; 6 digits (e.g. 1234567)</code><br><code>I9: Alphanumeric (e.g. 12A45B)</code></td>
        </tr>
        <tr>
            <td><strong>Recipient Account No.</strong><br>11 to 16 numeric digits</td>
            <td><code>V4: 11 to 16 numeric digits</code></td>
            <td><code>I10: &lt; 11 digits</code><br><code>I11: &gt; 16 digits</code><br><code>I12: Contains alphabet/symbols</code></td>
        </tr>
    </tbody>
</table>

<h3>2.2 Boundary Value Analysis (BVA)</h3>
<p>BVA tests values at the boundaries of equivalence partitions: Minimum (<code>Min</code>), Just above Min (<code>Min+</code>), Nominal (<code>Nom</code>), Just below Max (<code>Max-</code>), Maximum (<code>Max</code>), and out-of-boundary values (<code>Min-</code>, <code>Max+</code>).</p>

<table>
    <thead>
        <tr><th>Input Variable</th><th>Boundary Limits</th><th>Test Values Selected</th><th>Class Category</th><th>Expected Outcome</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>Fund Transfer (₹)</strong></td><td>[1.00 to 500,000.00]</td><td>₹0.99</td><td>Min - 1 (Invalid)</td><td>Error: "Minimum transfer amount is ₹1.00"</td></tr>
        <tr><td></td><td></td><td>₹1.00</td><td>Min (Valid)</td><td>Transfer Request Processed</td></tr>
        <tr><td></td><td></td><td>₹2.00</td><td>Min + 1 (Valid)</td><td>Transfer Request Processed</td></tr>
        <tr><td></td><td></td><td>₹250,000.00</td><td>Nominal (Valid)</td><td>Transfer Request Processed</td></tr>
        <tr><td></td><td></td><td>₹499,999.99</td><td>Max - 1 (Valid)</td><td>Transfer Request Processed</td></tr>
        <tr><td></td><td></td><td>₹500,000.00</td><td>Max (Valid)</td><td>Transfer Request Processed</td></tr>
        <tr><td></td><td></td><td>₹500,000.01</td><td>Max + 1 (Invalid)</td><td>Error: "Exceeds per-transaction limit of ₹5,00,000"</td></tr>
        <tr><td><strong>Login PIN Retry Counter</strong></td><td>[1 to 3 attempts]</td><td>Attempt 1 & 2 (Failed)</td><td>Within limit</td><td>Prompt: "Invalid PIN. Remaining attempts: X"</td></tr>
        <tr><td></td><td></td><td>Attempt 3 (Failed)</td><td>Boundary Max</td><td>Error: "Account Locked for 24 hours. Contact support."</td></tr>
        <tr><td></td><td></td><td>Attempt 4</td><td>Out of bound</td><td>Direct rejection: "Account is in LOCKED state"</td></tr>
    </tbody>
</table>

<div class="page-break"></div>

<h2>3. White Box Testing & Code Coverage Analysis</h2>

<h3>3.1 Target Algorithm: Fund Transfer Execution Service</h3>
<p>Below is the core transactional method under structural test:</p>

<pre>
1: function executeFundTransfer(senderAcc, receiverAcc, amount, otp, inputOtp) {
2:     if (otp !== inputOtp) {
3:         return { success: false, code: "INVALID_OTP" };
4:     }
5:     if (amount <= 0 || amount > senderAcc.dailyLimit) {
6:         return { success: false, code: "INVALID_AMOUNT" };
7:     }
8:     if (senderAcc.balance < amount) {
9:         return { success: false, code: "INSUFFICIENT_FUNDS" };
10:    }
11:    senderAcc.balance -= amount;
12:    receiverAcc.balance += amount;
13:    logLedgerEntry(senderAcc.id, receiverAcc.id, amount, "SUCCESS");
14:    return { success: true, code: "TRANSFER_COMPLETED" };
15: }
</pre>

<h3>3.2 Control Flow Graph (CFG)</h3>

<div class="diagram-container">
<pre class="mermaid">
flowchart TD
    N1["Node 1: Entry & OTP Check (Line 2)"]
    N2["Node 2: Return INVALID_OTP (Line 3-4)"]
    N3["Node 3: Amount Validation (Line 5)"]
    N4["Node 4: Return INVALID_AMOUNT (Line 6-7)"]
    N5["Node 5: Balance Check (Line 8)"]
    N6["Node 6: Return INSUFFICIENT_FUNDS (Line 9-10)"]
    N7["Node 7: Debit/Credit Ledger & Return SUCCESS (Line 11-14)"]
    N8["Node 8: Exit (Line 15)"]

    N1 -->|True: otp != inputOtp| N2
    N1 -->|False: otp == inputOtp| N3

    N2 --> N8

    N3 -->|True: amount <= 0 or > limit| N4
    N3 -->|False: valid amount| N5

    N4 --> N8

    N5 -->|True: balance < amount| N6
    N5 -->|False: balance >= amount| N7

    N6 --> N8
    N7 --> N8
</pre>
<div class="diagram-caption">Figure 3.1 — Control Flow Graph (CFG) for Fund Transfer Algorithm</div>
</div>

<h3>3.3 Cyclomatic Complexity Calculation</h3>
<div class="card">
    <p>Cyclomatic Complexity $V(G)$ evaluates the structural complexity and the minimum number of independent test paths required for $100\%$ branch coverage.</p>
    <ul>
        <li><strong>Formula 1 (Edges & Nodes):</strong> $V(G) = E - N + 2P$
            <br>Number of Edges $E = 10$, Number of Nodes $N = 8$, Connected Components $P = 1$
            <br>$$V(G) = 10 - 8 + 2(1) = \mathbf{4}$$
        </li>
        <li><strong>Formula 2 (Predicate Nodes):</strong> $V(G) = P_N + 1$
            <br>Predicate Nodes with binary decisions: Node 1, Node 3, Node 5 ($P_N = 3$)
            <br>$$V(G) = 3 + 1 = \mathbf{4}$$
        </li>
        <li><strong>Formula 3 (Enclosed Regions):</strong> $V(G) = R_1 + R_2 + R_3 + R_{\text{outer}} = \mathbf{4}$</li>
    </ul>
</div>

<h3>3.4 Basis Path Testing & Coverage Matrix</h3>
<table>
    <thead>
        <tr><th>Path ID</th><th>Execution Sequence (Nodes)</th><th>Test Condition / Input Vector</th><th>Targeted Outcome</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>Path 1</strong></td><td>$1 \rightarrow 2 \rightarrow 8$</td><td><code>otp = 123456, inputOtp = 999999</code></td><td>OTP Mismatch $\rightarrow$ <code>INVALID_OTP</code></td></tr>
        <tr><td><strong>Path 2</strong></td><td>$1 \rightarrow 3 \rightarrow 4 \rightarrow 8$</td><td><code>otp = 123456, inputOtp = 123456, amount = -500</code></td><td>Invalid Amount $\rightarrow$ <code>INVALID_AMOUNT</code></td></tr>
        <tr><td><strong>Path 3</strong></td><td>$1 \rightarrow 3 \rightarrow 5 \rightarrow 6 \rightarrow 8$</td><td><code>amount = 10000, senderBalance = 2000</code></td><td>Insufficient Balance $\rightarrow$ <code>INSUFFICIENT_FUNDS</code></td></tr>
        <tr><td><strong>Path 4</strong></td><td>$1 \rightarrow 3 \rightarrow 5 \rightarrow 7 \rightarrow 8$</td><td><code>amount = 5000, senderBalance = 25000, OTP valid</code></td><td>Full Success $\rightarrow$ <code>TRANSFER_COMPLETED</code></td></tr>
    </tbody>
</table>

<div class="page-break"></div>

<h2>4. Master Test Plan (IEEE 829 Compliant)</h2>

<div class="card">
    <p><strong>4.1 Test Identifier:</strong> <code>TP-BANK-2026-V1.0</code></p>
    <p><strong>4.2 Test Objectives:</strong> Ensure $100\%$ zero-defect tolerance on double-entry accounting transactions, sub-second latency for authentication, and strict compliance with PCI-DSS & RBI digital banking security guidelines.</p>
    <p><strong>4.3 Test Strategy:</strong></p>
    <ul>
        <li><strong>Unit & Component Testing:</strong> Jest & Mocha for domain services, interest math, and ledger balance integrity.</li>
        <li><strong>API & Integration Testing:</strong> Supertest & Postman automated test suites validating HTTP status codes, HMAC signatures, and database rollbacks.</li>
        <li><strong>System & Security Testing:</strong> OWASP Top 10 penetration testing, SQL injection, CSRF token validation, and distributed rate-limiting.</li>
        <li><strong>Performance & Concurrency Testing:</strong> JMeter / k6 simulating 500 concurrent fund transfers targeting the same account to detect race conditions.</li>
    </ul>
    <p><strong>4.4 Entry & Exit Criteria:</strong></p>
    <ul>
        <li><strong>Entry Criteria:</strong> Code freeze achieved, database schema migrations applied in Staging, unit test code coverage $\ge 90\%$.</li>
        <li><strong>Exit Criteria:</strong> $100\%$ of Critical (P1) and High (P2) bugs resolved; $0$ open financial calculation anomalies; all regression suites passed.</li>
    </ul>
</div>

<div class="page-break"></div>

<h2>5. Comprehensive Test Cases Specification</h2>

<table>
    <thead>
        <tr><th>Test ID</th><th>Module</th><th>Test Description</th><th>Input Data</th><th>Expected Result</th><th>Status</th></tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>TC-BNK-01</strong></td>
            <td>Authentication</td>
            <td>Verify login with valid credentials & valid 2FA OTP</td>
            <td><code>User: "bankim_k", Pass: "SecurePass@2026", OTP: "482019"</code></td>
            <td><code>200 OK</code>, JWT session token generated, redirected to Dashboard</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-02</strong></td>
            <td>Authentication</td>
            <td>Verify account lock after 3 consecutive failed login attempts</td>
            <td>3 invalid password attempts on <code>User: "bankim_k"</code></td>
            <td><code>423 Locked</code>, Account status updated to LOCKED, SMS alert dispatched</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-03</strong></td>
            <td>Fund Transfer</td>
            <td>Transfer amount equal to exact account balance</td>
            <td><code>Balance: ₹10,000, Transfer: ₹10,000</code></td>
            <td><code>200 OK</code>, Remaining Balance: ₹0.00, Double-entry ledger balanced</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-04</strong></td>
            <td>Fund Transfer</td>
            <td>Transfer amount exceeding daily ceiling limit</td>
            <td><code>Daily Limit: ₹5,00,000, Transfer: ₹5,00,001</code></td>
            <td><code>400 Bad Request</code>, "Daily transfer limit exceeded"</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-05</strong></td>
            <td>Fund Transfer</td>
            <td>Concurrent double-transfer race condition check</td>
            <td>Two simultaneous ₹5,000 transfers with balance ₹6,000</td>
            <td>First transfer succeeds; Second transfer rejected with <code>INSUFFICIENT_FUNDS</code></td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-06</strong></td>
            <td>Beneficiary</td>
            <td>Transfer during cooling-off period (1st 30 mins)</td>
            <td><code>Transfer: ₹75,000</code> to newly added payee</td>
            <td><code>403 Forbidden</code>, "Cooling limit capped at ₹25,000 for initial 30 minutes"</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-07</strong></td>
            <td>Security / SQLi</td>
            <td>SQL Injection vulnerability in account statement search</td>
            <td><code>Search query: ' OR '1'='1' --</code></td>
            <td>Input sanitized by ORM/Parameterized query; <code>200 OK</code> with empty/filtered list</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
        <tr>
            <td><strong>TC-BNK-08</strong></td>
            <td>Interest Engine</td>
            <td>Calculate leap year compound interest</td>
            <td><code>P: ₹1,00,000, R: 7.5%, Days: 366 (Leap Year)</code></td>
            <td>Exact interest ₹7,713.82 credited to balance without floating point drift</td>
            <td><span class="badge-pass">PASS</span></td>
        </tr>
    </tbody>
</table>

<div class="page-break"></div>

<h2>6. Defect & Bug Reports (IEEE 1044 Standard)</h2>

<div class="card">
    <p><strong>Bug ID:</strong> <code>BUG-BNK-2026-001</code> &nbsp;|&nbsp; <strong>Severity:</strong> <span style="color:#b91c1c; font-weight:700;">Critical (P1)</span> &nbsp;|&nbsp; <strong>Module:</strong> Fund Transfer Engine</p>
    <p><strong>Summary:</strong> Concurrency Race Condition allowed Account Overdraft without Approved Credit Line.</p>
    <p><strong>Environment:</strong> Staging Cluster / PostgreSQL 16 / Node.js 20 API Server</p>
    <p><strong>Pre-conditions:</strong> Account #4001 has exactly ₹5,000.00 balance.</p>
    <p><strong>Steps to Reproduce:</strong></p>
    <ol>
        <li>Send two simultaneous <code>POST /api/transfers</code> requests with payload <code>{ amount: 5000, recipient: 9002 }</code> within $10\text{ ms}$.</li>
        <li>Inspect final account balance in <code>accounts</code> table.</li>
    </ol>
    <p><strong>Observed Result:</strong> Both transactions were committed. Account #4001 balance dropped to <code>-₹5,000.00</code>.</p>
    <p><strong>Expected Result:</strong> One transaction must succeed and the second must be rejected with <code>INSUFFICIENT_FUNDS</code>.</p>
    <p><strong>Root Cause Analysis (RCA):</strong> Non-atomic read-then-write database queries allowed dirty reads under default isolation level.</p>
    <p><strong>Remediation:</strong> Enforced PostgreSQL row-level pessimistic locking (<code>SELECT ... FOR UPDATE</code>) inside an explicit ACID transaction block.</p>
</div>

<div class="card">
    <p><strong>Bug ID:</strong> <code>BUG-BNK-2026-002</code> &nbsp;|&nbsp; <strong>Severity:</strong> <span style="color:#ea580c; font-weight:700;">High (P2)</span> &nbsp;|&nbsp; <strong>Module:</strong> 2FA / Authentication</p>
    <p><strong>Summary:</strong> OTP Expiration Window not invalidated upon successful verification.</p>
    <p><strong>Observed Result:</strong> The same OTP could be replayed within its 5-minute lifespan for subsequent transfer authorizations.</p>
    <p><strong>Remediation:</strong> Immediately set <code>otp_used = TRUE</code> in Redis cache upon first successful verification.</p>
</div>

<h2>7. Test Summary & Regression Analysis Report</h2>

<table>
    <thead>
        <tr><th>Metric Name</th><th>Calculated Value</th><th>Quality Benchmark</th><th>Verdict</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>Total Test Cases Executed</strong></td><td>150</td><td>100% of planned suite</td><td><strong>Compliant</strong></td></tr>
        <tr><td><strong>Passed Test Cases</strong></td><td>147</td><td>&ge; 98%</td><td><span class="badge-pass">PASS</span> (98.0%)</td></tr>
        <tr><td><strong>Defects Identified (Total)</strong></td><td>6 (2 Critical, 3 High, 1 Medium)</td><td>Resolved during sprint</td><td><strong>All Closed</strong></td></tr>
        <tr><td><strong>Code Statement Coverage</strong></td><td>94.2%</td><td>&ge; 90%</td><td><span class="badge-pass">EXCEEDED</span></td></tr>
        <tr><td><strong>Branch Coverage (White Box)</strong></td><td>96.8%</td><td>&ge; 90%</td><td><span class="badge-pass">EXCEEDED</span></td></tr>
        <tr><td><strong>Regression Test Suite Pass Rate</strong></td><td>100% (Post-fix build)</td><td>100% Zero-Regressions</td><td><span class="badge-pass">READY FOR RELEASE</span></td></tr>
    </tbody>
</table>

<div class="page-break"></div>

<h2>8. Project Planning & Software Engineering Tools</h2>

<h3>8.1 Work Breakdown Structure (WBS)</h3>
<pre>
1.0 Online Banking System Testing
 ├── 1.1 Test Planning & Requirements Analysis
 │    ├── 1.1.1 SRS requirement mapping & IEEE 829 Test Plan
 │    └── 1.1.2 Traceability matrix (RTM) formulation
 ├── 1.2 Black Box Test Design
 │    ├── 1.2.1 Equivalence Class Partitioning (ECP)
 │    ├── 1.2.2 Boundary Value Analysis (BVA)
 │    └── 1.2.3 Decision table & state transition testing
 ├── 1.3 White Box Testing & Code Inspection
 │    ├── 1.3.1 Control Flow Graph (CFG) generation
 │    ├── 1.3.2 Cyclomatic complexity calculation: V(G) = 4
 │    └── 1.3.3 Basis path execution & statement coverage
 ├── 1.4 Automated Execution & Defect Management
 │    ├── 1.4.1 Supertest & Jest integration suite execution
 │    ├── 1.4.2 Concurrency & race condition test via JMeter
 │    └── 1.4.3 IEEE 1044 bug logging & root cause analysis
 └── 1.5 Test Closure & Regression Sign-Off
      ├── 1.5.1 Regression test cycle & patch validation
      └── 1.5.2 Executive Test Summary & Compliance Sign-off
</pre>

<h3>8.2 Software Engineering Tools Matrix</h3>
<table>
    <thead>
        <tr><th>Tool Category</th><th>Tool Name</th><th>Application in Banking Testing</th></tr>
    </thead>
    <tbody>
        <tr><td><strong>Unit & Coverage</strong></td><td>Jest + Istanbul / c8</td><td>Statement, branch, and function code coverage verification.</td></tr>
        <tr><td><strong>API Testing</strong></td><td>Postman + Newman + Supertest</td><td>Automated REST endpoint validation and HMAC token testing.</td></tr>
        <tr><td><strong>Load & Concurrency</strong></td><td>Apache JMeter / k6</td><td>Simulating high-volume concurrent funds transfer & race conditions.</td></tr>
        <tr><td><strong>Security Scanning</strong></td><td>OWASP ZAP + Snyk</td><td>Detecting XSS, SQLi, broken object level authorization (BOLA).</td></tr>
        <tr><td><strong>Defect Tracking</strong></td><td>Jira Software + GitHub Issues</td><td>Bug lifecycle tracking from New $\rightarrow$ In Progress $\rightarrow$ Fixed $\rightarrow$ Verified.</td></tr>
    </tbody>
</table>

<h2>9. Viva Voce Questions & Model Answers</h2>

<div class="callout">
    <p><strong>Q1: What is the primary difference between Equivalence Partitioning (EP) and Boundary Value Analysis (BVA)?</strong></p>
    <p style="margin-top:6px; color:#334155;"><em>Answer:</em> EP divides the entire input domain into classes of valid and invalid values where the system is expected to behave identically for any representative value. BVA specifically tests the critical extreme boundaries of those partitions ($Min, Min+1, Max-1, Max$), because defect density is statistically highest at input boundaries.</p>
</div>

<div class="callout">
    <p><strong>Q2: How do you calculate Cyclomatic Complexity and why is it crucial for banking software?</strong></p>
    <p style="margin-top:6px; color:#334155;"><em>Answer:</em> Calculated using $V(G) = E - N + 2P$ (or Predicate nodes $+ 1$). It defines the upper bound on the number of test cases required to achieve $100\%$ basis path coverage. In banking, it guarantees that every possible error condition (e.g., overdraft, invalid OTP, currency mismatch) is rigorously executed.</p>
</div>

<div class="callout">
    <p><strong>Q3: How do you prevent and test for double-spending / race conditions in online fund transfers?</strong></p>
    <p style="margin-top:6px; color:#334155;"><em>Answer:</em> Tested via multi-threaded concurrent requests (JMeter/Supertest) hitting the same account simultaneously. Prevention requires database-level pessimistic locking (<code>SELECT FOR UPDATE</code>) or serializable transaction isolation levels so that balances are updated sequentially and atomically.</p>
</div>

</body>
</html>
"""

html_path = "/Users/bankimkamila/Tevar/docs/PRACTICAL_4_ONLINE_BANKING_TESTING.html"
pdf_path = "/Users/bankimkamila/Tevar/docs/PRACTICAL_4_ONLINE_BANKING_TESTING.pdf"
md_path = "/Users/bankimkamila/Tevar/docs/PRACTICAL_4_ONLINE_BANKING_TESTING.md"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_path}")

# Run headless chrome to convert HTML to PDF
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
if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
    print(f"SUCCESS: PDF generated at {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
else:
    print("PDF generation failed.")
