// controllers/contactController.js
import Contact from '../models/Contact.js';
import { query } from '../config/mysql.js';
import fileWriter from '../utils/fileWriter.js';

// @desc    Submit contact form
// @route   POST /api/contact
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Save to MongoDB
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      phone: phone || undefined,
      status: 'new'
    });
    console.log('✅ MongoDB contact saved:', contact._id);

    // Save to MySQL with better error handling
    try {
      const sql = 'INSERT INTO contacts (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)';
      const params = [name, email, subject, message, 'new'];
      
      console.log('📝 Attempting MySQL insert...');
      console.log('SQL:', sql);
      console.log('Params:', params);
      
      const result = await query(sql, params);
      console.log('✅ MySQL insert successful:', result);
      
    } catch (mysqlError) {
      console.error('❌ MySQL insert error details:');
      console.error('- Error code:', mysqlError.code);
      console.error('- Error message:', mysqlError.message);
      console.error('- SQL state:', mysqlError.sqlState);
      console.error('- SQL:', mysqlError.sql);
    }

    // Write to .txt file
    await fileWriter.writeContactData({ name, email, subject, message, phone });
    console.log('✅ File write successful');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    
    console.error('❌ Contact submission error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all contacts (Admin only) - MONGODB VERSION
// @route   GET /api/contact
export const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build filter
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get contacts from MongoDB
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('repliedBy', 'name email');

    const total = await Contact.countDocuments(filter);

    // Get stats
    const stats = await Contact.getStats();

    res.json({
      success: true,
      count: contacts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats,
      data: contacts
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all contacts from MySQL (Alternative - if needed)
// @route   GET /api/contact/mysql
export const getContactsFromMySQL = async (req, res) => {
  try {
    const sql = 'SELECT * FROM contacts ORDER BY createdAt DESC';
    const rows = await query(sql);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Get contacts from MySQL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single contact (Admin only)
// @route   GET /api/contact/:id
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('repliedBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Mark as read when viewed
    await contact.markAsRead();

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update contact status (Admin only) - NEW FUNCTION
// @route   PUT /api/contact/:id/status
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['new', 'read', 'replied'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: new, read, replied'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.status = status;
    await contact.save();

    // Update in MySQL
    try {
      await query('UPDATE contacts SET status = ? WHERE email = ? AND subject = ?', 
        [status, contact.email, contact.subject]);
    } catch (mysqlError) {
      console.log('MySQL update error (non-critical):', mysqlError.message);
    }

    res.json({
      success: true,
      message: `Contact status updated to ${status}`,
      data: contact
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reply to contact (Admin only)
// @route   POST /api/contact/:id/reply
export const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.markAsReplied(replyMessage, req.user.id);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: contact
    });

  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete contact (Admin only)
// @route   DELETE /api/contact/:id
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Also delete from MySQL
    try {
      await query('DELETE FROM contacts WHERE email = ? AND createdAt = ?', 
        [contact.email, contact.createdAt]);
    } catch (mysqlError) {
      console.log('MySQL delete error (non-critical):', mysqlError.message);
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get contact stats (Admin only)
// @route   GET /api/contact/stats
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Test MySQL connection
// @route   GET /api/contact/test-mysql
export const testMySQL = async (req, res) => {
  try {
    // Test 1: Simple query
    const testResult = await query('SELECT 1+1 as result');
    
    // Test 2: Check if table exists
    const tables = await query("SHOW TABLES");
    
    // Test 3: Try to insert a test record
    const testInsert = await query(
      'INSERT INTO contacts (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)',
      ['Test User', 'test@test.com', 'Test Subject', 'Test Message', 'new']
    );
    
    // Test 4: Retrieve the test record
    const testSelect = await query('SELECT * FROM contacts WHERE email = ?', ['test@test.com']);
    
    // Clean up
    await query('DELETE FROM contacts WHERE email = ?', ['test@test.com']);
    
    res.json({
      success: true,
      message: 'MySQL is working!',
      data: {
        testQuery: testResult,
        tables: tables,
        insertWorked: !!testInsert,
        selectWorked: testSelect.length > 0
      }
    });
    
  } catch (error) {
    console.error('❌ MySQL test failed:', error);
    res.status(500).json({
      success: false,
      message: 'MySQL test failed',
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
};

export default {
  submitContact,
  getContacts,
  getContactsFromMySQL,
  getContactById,
  updateContactStatus,
  replyToContact,
  deleteContact,
  getContactStats,
  testMySQL
};