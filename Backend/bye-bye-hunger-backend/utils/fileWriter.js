// utils/fileWriter.js
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileWriter {
  constructor() {
    this.logsDir = join(__dirname, '../logs');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating logs directory:', error.message);
    }
  }

  getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  }

  // Format date for logs
  getFormattedDate() {
    const now = new Date();
    return now.toLocaleString();
  }

  // Write to a specific log file (for daily logs)
  async writeToDailyLog(filename, data) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dailyFilename = `${filename}-${dateStr}.log`;
    const filePath = join(this.logsDir, dailyFilename);
    
    const timestamp = this.getFormattedDate();
    const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n${'-'.repeat(80)}\n`;
    
    await fs.appendFile(filePath, logEntry);
    return filePath;
  }

  // Existing method - updated with more info
  async writeContactData(data) {
    try {
      const filename = `contact_${this.getTimestamp()}.txt`;
      const filePath = join(this.logsDir, filename);
      
      const content = `
========================================
CONTACT FORM SUBMISSION
========================================
Date: ${this.getFormattedDate()}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'N/A'}
Subject: ${data.subject}
----------------------------------------
Message:
${data.message}
----------------------------------------
Status: ${data.status || 'new'}
IP Address: ${data.ip || 'N/A'}
========================================
      `.trim();
      
      await fs.writeFile(filePath, content);
      console.log(`✅ Contact data written to: ${filename}`);
      
      // Also write to daily log for aggregation
      await this.writeToDailyLog('contacts', data);
      
      return filePath;
    } catch (error) {
      console.error('Error writing contact data:', error.message);
      await this.writeErrorData({ error: error.message, context: 'writeContactData', data });
    }
  }

  // Updated user data method with more fields
  async writeUserData(data) {
    try {
      const filename = `user_${this.getTimestamp()}.txt`;
      const filePath = join(this.logsDir, filename);
      
      let content = '';
      
      // Handle different types of user actions
      switch(data.action) {
        case 'registration':
          content = `
========================================
USER REGISTRATION
========================================
Date: ${this.getFormattedDate()}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'N/A'}
Role: ${data.role || 'user'}
Loyalty Points: ${data.loyaltyPoints || 0}
Action: ${data.action}
========================================
          `.trim();
          break;
          
        case 'login':
          content = `
========================================
USER LOGIN
========================================
Date: ${this.getFormattedDate()}
Name: ${data.name}
Email: ${data.email}
Action: Login
========================================
          `.trim();
          break;
          
        case 'profile_update':
          content = `
========================================
PROFILE UPDATE
========================================
Date: ${this.getFormattedDate()}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'N/A'}
Address: ${data.address || 'N/A'}
Dietary Preference: ${data.dietaryPreference || 'N/A'}
Action: ${data.action}
========================================
          `.trim();
          break;
          
        case 'points_added':
          content = `
========================================
LOYALTY POINTS ADDED
========================================
Date: ${this.getFormattedDate()}
User: ${data.userEmail || data.email}
Points Added: ${data.pointsAdded}
New Total: ${data.newTotal}
Reason: ${data.reason}
Action: ${data.action}
========================================
          `.trim();
          break;
          
        default:
          content = `
========================================
USER ${data.action?.toUpperCase() || 'ACTION'}
========================================
Date: ${this.getFormattedDate()}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'N/A'}
Role: ${data.role || 'user'}
Action: ${data.action || 'registration'}
========================================
          `.trim();
      }
      
      await fs.writeFile(filePath, content);
      console.log(`✅ User data written to: ${filename}`);
      
      // Also write to daily log
      await this.writeToDailyLog('users', data);
      
      return filePath;
    } catch (error) {
      console.error('Error writing user data:', error.message);
      await this.writeErrorData({ error: error.message, context: 'writeUserData', data });
    }
  }

  // Updated order data method with more details
  async writeOrderData(data) {
    try {
      const filename = `order_${this.getTimestamp()}.txt`;
      const filePath = join(this.logsDir, filename);
      
      let content = '';
      
      // Check if this is a status update or new order
      if (data.action === 'status_update') {
        content = `
========================================
ORDER STATUS UPDATE
========================================
Date: ${this.getFormattedDate()}
Order: ${data.orderNumber}
Previous Status: ${data.oldStatus}
New Status: ${data.newStatus}
Updated By: ${data.updatedBy || 'System'}
========================================
        `.trim();
      } else {
        // Full order receipt
        const itemsList = data.items?.map((item, i) => 
          `${i + 1}. ${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n') || 'No items';
        
        content = `
========================================
ORDER RECEIPT
========================================
Date: ${this.getFormattedDate()}
Order Number: ${data.orderNumber}
Order Type: ${data.orderType || 'delivery'}
Customer: ${data.customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone || 'N/A'}
----------------------------------------
ITEMS:
${itemsList}
----------------------------------------
Subtotal: $${(data.subtotal || 0).toFixed(2)}
Tax (10%): $${(data.tax || 0).toFixed(2)}
Delivery Fee: $${(data.deliveryFee || 0).toFixed(2)}
TOTAL: $${(data.totalAmount || 0).toFixed(2)}
----------------------------------------
Delivery Address: ${data.deliveryAddress || 'N/A'}
Payment Method: ${data.paymentMethod || 'N/A'}
Status: ${data.status || 'pending'}
Points Earned: ${data.pointsEarned || 0}
----------------------------------------
Special Instructions: ${data.specialInstructions || 'None'}
========================================
        `.trim();
      }
      
      await fs.writeFile(filePath, content);
      console.log(`✅ Order data written to: ${filename}`);
      
      // Also write to daily log
      await this.writeToDailyLog('orders', data);
      
      return filePath;
    } catch (error) {
      console.error('Error writing order data:', error.message);
      await this.writeErrorData({ error: error.message, context: 'writeOrderData', data });
    }
  }

  // New method for booking data
  async writeBookingData(data) {
    try {
      const filename = `booking_${this.getTimestamp()}.txt`;
      const filePath = join(this.logsDir, filename);
      
      let content = '';
      
      // Check if this is a cancellation or status update
      if (data.action === 'cancelled') {
        content = `
========================================
BOOKING CANCELLATION
========================================
Date: ${this.getFormattedDate()}
Booking ID: ${data.bookingId}
Cancelled At: ${data.cancelledAt || this.getFormattedDate()}
Cancellation Reason: ${data.cancellationReason || 'Cancelled by user'}
User ID: ${data.userId || 'N/A'}
========================================
        `.trim();
      } else if (data.action === 'status_updated') {
        content = `
========================================
BOOKING STATUS UPDATE
========================================
Date: ${this.getFormattedDate()}
Booking ID: ${data.bookingId}
Previous Status: ${data.oldStatus}
New Status: ${data.newStatus}
Updated By: ${data.updatedBy || 'System'}
========================================
        `.trim();
      } else {
        // New booking
        content = `
========================================
TABLE BOOKING
========================================
Date: ${this.getFormattedDate()}
Booking ID: ${data.bookingId}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Booking Date: ${data.date}
Booking Time: ${data.time}
Guests: ${data.guests}
Special Requests: ${data.special_requests || 'None'}
Status: ${data.status || 'pending'}
User ID: ${data.userId || 'Guest'}
========================================
        `.trim();
      }
      
      await fs.writeFile(filePath, content);
      console.log(`✅ Booking data written to: ${filename}`);
      
      // Also write to daily log
      await this.writeToDailyLog('bookings', data);
      
      return filePath;
    } catch (error) {
      console.error('Error writing booking data:', error.message);
      await this.writeErrorData({ error: error.message, context: 'writeBookingData', data });
    }
  }

  // New method for error logging
  async writeErrorData(data) {
    try {
      const filename = `error_${this.getTimestamp()}.txt`;
      const filePath = join(this.logsDir, filename);
      
      const content = `
========================================
ERROR LOG
========================================
Date: ${this.getFormattedDate()}
Error: ${data.error}
Context: ${data.context || 'General'}
Additional Info: ${JSON.stringify(data.data || {}, null, 2)}
Stack: ${data.stack || 'N/A'}
========================================
      `.trim();
      
      await fs.writeFile(filePath, content);
      console.log(`⚠️ Error logged to: ${filename}`);
      
      // Also write to daily error log
      await this.writeToDailyLog('errors', data);
      
      return filePath;
    } catch (error) {
      console.error('Error writing error data:', error.message);
    }
  }

  // New method for loyalty points history
  async writeLoyaltyData(data) {
    try {
      const filename = `loyalty_${this.getTimestamp()}.txt`;
      const filePath = join(this.logsDir, filename);
      
      const content = `
========================================
LOYALTY POINTS ACTIVITY
========================================
Date: ${this.getFormattedDate()}
User: ${data.userEmail}
User ID: ${data.userId}
Points: ${data.points}
Type: ${data.type || 'added'}
Reason: ${data.reason}
Total Points: ${data.totalPoints || 'N/A'}
Action: ${data.action || 'points_activity'}
========================================
      `.trim();
      
      await fs.writeFile(filePath, content);
      console.log(`✅ Loyalty data written to: ${filename}`);
      
      await this.writeToDailyLog('loyalty', data);
      
      return filePath;
    } catch (error) {
      console.error('Error writing loyalty data:', error.message);
    }
  }

  // New method for general system logs
  async writeSystemLog(data) {
    try {
      await this.writeToDailyLog('system', data);
    } catch (error) {
      console.error('Error writing system log:', error.message);
    }
  }

  // New method for general logs (backward compatibility)
  async writeGeneralLog(data) {
    try {
      await this.writeToDailyLog('general', data);
    } catch (error) {
      console.error('Error writing general log:', error.message);
    }
  }
}

export default new FileWriter();