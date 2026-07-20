# Razorpay Merchant Onboarding & Compliance Report - The Outliers Studio

This document acts as our consolidated compliance check and operational disclosure report to satisfy **Razorpay Website Review** requirements for merchant onboarding. 

To prevent onboarding delays, all policies on our production site (`[WEBSITE_URL]`) must align with the disclosures below.

---

## 1. Registered Business Details
* **Legal Business Name**: `[BUSINESS_NAME]`
* **Trade / Brand Name**: `[BRAND_NAME]`
* **Registered Corporate Address**: `[REGISTERED_OFFICE_ADDRESS]`
* **Warehouse / Fulfillment Address**: `[WAREHOUSE_ADDRESS]`
* **GSTIN**: `[GSTIN]`
* **CIN**: `[CIN]`
* **Customer Support Contact**: `[SUPPORT_PHONE]` | `[SUPPORT_EMAIL]`

---

## 2. Payment Processing & Accepted Methods
Through our Razorpay gateway integration, we support and process payments through:
* **Cards**: Visa, Mastercard, RuPay, Diners Club, Maestro (domestic & international).
* **UPI**: Google Pay, PhonePe, Paytm, BHIM, and other UPI applications.
* **Net Banking**: All major public and private sector banks in India.
* **Wallets**: Major domestic wallet operators.
* **Settlement Currency**: All transactions are settled in Indian Rupees (INR).

---

## 3. Shipping & Delivery Timelines
* **Dispatch Period**: Orders are packed and dispatched from our warehouse in Bengaluru within **24 to 48 hours** (excluding Sundays and holidays).
* **Delivery Timeline**: 
  * Metro Cities: **3 to 5 business days**.
  * Tier 2 & 3: **5 to 7 business days**.
  * Remote Pincodes: **7 to 10 business days**.
* **Logistics Partners**: Blue Dart, Delhivery, Xpressbees, Shadowfax.
* **Policy Location**: Displayed publicly at `[WEBSITE_URL]/shipping-policy` (Review [Shipping-Policy.md](Shipping-Policy.md)).

---

## 4. Refund & Cancellation Terms

### A. Order Cancellation
* Orders can be cancelled by the user within **2 hours** of placement or prior to dispatch (whichever is earlier) through the "My Orders" panel or by emailing `[SUPPORT_EMAIL]`.
* Refund for cancelled prepaid orders is initiated immediately.

### B. Product Returns & Exchanges
* We offer a **7-day return/exchange window** from the date of delivery.
* Products must be unused, unwashed, and carry original tags/packaging.
* We offer one free exchange per order.

### C. Refund Method & Timelines
* **Method**: All refunds are processed back to the original source of payment (credit card, bank account, UPI wallet) via Razorpay API. No cash refunds are provided for online payments.
* **Timelines (Back-to-Source)**:
  * Credit/Debit Cards & Net Banking: **5 to 7 business days** (depending on the issuing bank).
  * UPI & Wallets: **2 to 3 business days**.
  * COD Orders: Refunded via NEFT/UPI within **5 to 7 business days** after the customer securely provides bank details.
* **Policy Location**: Displayed publicly at `[WEBSITE_URL]/refund-policy` (Review [Refund-Policy.md](Refund-Policy.md)).

---

## 5. Failed Transactions & Reversals
* In the case of a failed transaction where money was debited but the order was not generated, the funds are held by the card network or the customer's bank.
* The bank initiates auto-reversal back to the source account within **3 to 7 business days**.
* Customers can escalate unresolved failed debits to `[SUPPORT_EMAIL]` with UTR/RRN details.

---

## 6. Chargeback & Dispute Handling
* We take chargebacks seriously. Any claim of unauthorized payment will be thoroughly investigated.
* Our finance team responds to chargeback requests issued through Razorpay within **48 hours** by submitting necessary transaction logs, delivery proofs (POD signed receipts), and customer communications.
* Customers are encouraged to contact `[SUPPORT_EMAIL]` before raising disputes with their card-issuing banks to expedite resolutions.

---

## 7. Security & PCI-DSS Compliance Statement
* **PCI-DSS Level 1**: All customer payment processing is offloaded to Razorpay's checkout widgets. Razorpay maintains PCI-DSS Level 1 certification.
* **SSL Encryption**: All network requests on `[WEBSITE_URL]` are forced over HTTPS using 256-bit SSL certificates provided by Cloudflare, ensuring secure transmission of customer session tokens.
* **Data Privacy**: Customer contact details (email, shipping address) are stored in encrypted databases and are never shared with unauthorized third parties. Financial credentials are never touched, processed, or stored by our servers.
