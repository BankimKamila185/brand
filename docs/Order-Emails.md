# Transactional & Marketing Email Templates - The Outliers Studio

This file contains copy templates for our automated transactional and marketing emails integrated via **Resend**.

---

## 1. Order Confirmation (Prepaid)

* **Subject Line**: `Order Confirmed: #[Order_ID] — Your Outliers fit is locked in.`
* **Header**: Logo - The Outliers Studio

**Email Body**:
> **Hey [Customer_Name],**
>
> Your order has been successfully placed! We are packing your streetwear selection at our Bengaluru hub. Below is a summary of your order:
>
> * **Order Number**: `#[Order_ID]`
> * **Date**: [Transaction_Date]
> * **Shipping Address**: [Shipping_Address]
>
> ### Order Summary
> [Item_List_Placeholder - Name, Size, Qty, Price]
> * **Subtotal**: [Subtotal]
> * **GST (Included)**: [GST_Amount]
> * **Shipping**: [Shipping_Fee]
> * **Total Paid**: **[Total_Price]**
>
> We will send you another email with a tracking link as soon as your parcel is shipped.
>
> [View Order Status](file:///order-status-link)
>
> Stay distinct,  
> **The Outliers Studio Team**

---

## 2. Order Shipped

* **Subject Line**: `Your drop is on the move. Track Order #[Order_ID]`

**Email Body**:
> **Hey [Customer_Name],**
>
> Exciting news—your streetwear items have been shipped! Our logistics partner has picked up your package from our Bengaluru warehouse.
>
> * **Order Number**: `#[Order_ID]`
> * **Courier Partner**: [Courier_Name] (e.g. Blue Dart)
> * **Tracking Number**: `[Tracking_ID]`
>
> [Track Your Shipment Live](file:///tracking-link)
>
> **Estimated Delivery**: [Estimated_Delivery_Date]
>
> *Note: It might take up to 12-24 hours for the tracking status to become active on the courier system.*

---

## 3. Order Delivered

* **Subject Line**: `Delivered: Order #[Order_ID] has arrived.`

**Email Body**:
> **Hey [Customer_Name],**
>
> Tracking records show that your order `#[Order_ID]` was successfully delivered to your address.
>
> **Not with you?** If you have not received this package, please check with your building security, family members, or neighbors. If you still cannot locate it, contact us immediately at `[SUPPORT_EMAIL]` or call `[SUPPORT_PHONE]`.
>
> **Love the fit?** Share your style on Instagram and tag us **@theoutliersstudio** to get featured!
>
> [Review Your Purchase](file:///review-link)

---

## 4. Refund Completed

* **Subject Line**: `Refund Successful: #[Order_ID]`

**Email Body**:
> **Hey [Customer_Name],**
>
> We have successfully processed your refund for order `#[Order_ID]`. 
>
> * **Refunded Amount**: [Refund_Amount]
> * **Destination**: Original Payment Source (via Razorpay)
> * **Transaction ID**: `[Refund_Transaction_ID]`
>
> **When will I see the money?**
> * UPI & Wallets: **2 to 3 business days**.
> * Cards & Net Banking: **5 to 7 business days** (depending on your bank's processing cycle).
>
> If you have questions, please reply directly to this email.

---

## 5. Exchange Approved

* **Subject Line**: `Exchange Approved: Order #[Order_ID]`

**Email Body**:
> **Hey [Customer_Name],**
>
> Good news! Your exchange request for order `#[Order_ID]` has been approved by our quality control team.
>
> * **Item Returned**: [Old_Item_Details - Size]
> * **New Item Issued**: [New_Item_Details - Size]
> * **New Shipment Tracking**: [New_Tracking_ID]
>
> We have dispatched your replacement size from our warehouse. You can track it here:
>
> [Track Replacement Order](file:///tracking-link)

---

## 6. Exchange Rejected

* **Subject Line**: `Update: Exchange Request Rejected for Order #[Order_ID]`

**Email Body**:
> **Hey [Customer_Name],**
>
> We are writing to inform you that our quality control team has inspected the returned item for order `#[Order_ID]` and was unable to approve the exchange.
>
> **Reason for Rejection**: [Rejection_Reason - e.g. "Signs of wear/laundering detected", "Missing original brand tags"]
>
> As per our [Return & Exchange Policy](Return-Policy.md), we only accept items in their original, unused, and unwashed condition with tags attached.
>
> **Next Steps**:
> We will return the original item back to your address. A support associate will contact you to collect the redelivery shipping charge of INR 99.
>
> If you believe this is an error, please contact us at `[GRIEVANCE_EMAIL]`.

---

## 7. Cancellation Confirmed

* **Subject Line**: `Order Cancelled: #[Order_ID]`

**Email Body**:
> **Hey [Customer_Name],**
>
> We have successfully cancelled your order `#[Order_ID]` as per your request.
>
> **Refund Status**: 
> * For prepaid orders, a full refund of [Refund_Amount] has been initiated via Razorpay back to your original payment method. The amount should reflect in your account within 5–7 business days.
> * For COD orders, no payments were collected, so no further actions are required.
>
> We hope to see you back soon!
>
> [Explore New Drops](file:///shop-link)

---

## 8. Welcome Email

* **Subject Line**: `Welcome to The Outliers Studio. Here is your code.`

**Email Body**:
> **Welcome to the circle, [Customer_Name].**
>
> The Outliers Studio is now your destination for premium, Gen Z streetwear. We design in limited batches to make sure your fit remains unique.
>
> As a thank you for joining us, here is an exclusive **10% discount** code on your first order:
>
> **WELCOME10**
>
> [Shop Streetwear Drops](file:///shop-link)
>
> Catch you on the layout,  
> **The Outliers Studio Team**

---

## 9. Newsletter Email (Standard Layout)

* **Subject Line**: `DROP 04: The Overdyed Utility Jackets have landed.`

**Email Body**:
> **Hey [Customer_Name],**
>
> This is **DROP 04: Industrial Brutalism**.
>
> We just launched our newest collection of heavy-weight overdyed utility jackets and distressed oversized hoodies. Crafted with double-stitch detailing, structured fits, and premium Indian cotton.
>
> *Limited quantities. No restocks.*
>
> [Explore Drop 04](file:///shop-link)
>
> ---
> *You are receiving this email because you opted in to receive marketing updates from The Outliers Studio. You can [unsubscribe](file:///unsubscribe-link) or [manage your preferences](file:///preferences-link) at any time.*
