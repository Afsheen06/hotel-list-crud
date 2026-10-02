const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { uploadDir } = require('../middleware/upload');

// ---- Validation helpers ----
function validateHotelInput(body, { requireAll }) {
  const errors = {};
  const { title, description, latitude, longitude, price } = body;

  if (requireAll || title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) errors.title = 'Title is required';
    else if (title.trim().length > 150) errors.title = 'Title must be 150 characters or fewer';
  }

  if (requireAll || description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) errors.description = 'Description is required';
  }

  if (requireAll || latitude !== undefined) {
    const lat = Number(latitude);
    if (!['string', 'number'].includes(typeof latitude) || String(latitude).trim() === '' || !Number.isFinite(lat)) {
      errors.latitude = 'Latitude must be a number';
    } else if (lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
  }

  if (requireAll || longitude !== undefined) {
    const lng = Number(longitude);
    if (!['string', 'number'].includes(typeof longitude) || String(longitude).trim() === '' || !Number.isFinite(lng)) {
      errors.longitude = 'Longitude must be a number';
    } else if (lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
  }

  if (requireAll || price !== undefined) {
    const p = Number(price);
    if (!['string', 'number'].includes(typeof price) || String(price).trim() === '' || !Number.isFinite(p)) {
      errors.price = 'Price must be a number';
    } else if (p < 0 || p > 99999999.99) {
      errors.price = 'Price must be between 0 and 99999999.99';
    }
  }

  return errors;
}

function deleteImageFile(imagePath) {
  if (!imagePath) return;
  if (imagePath.startsWith('https://')) {
    const match = imagePath.match(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\/(hotel-list-crud\/.+)\.[a-zA-Z0-9]+$/);
    if (match && process.env.CLOUDINARY_URL) {
      require('cloudinary').v2.uploader.destroy(match[1]).catch(() => console.error('Cloud image cleanup failed'));
    }
    return;
  }
  // Bundled sample photos must remain available after a redeploy.
  if (path.basename(imagePath).startsWith('seed-hotel-')) return;
  const fileName = path.basename(imagePath);
  const fullPath = path.join(uploadDir, fileName);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete image file:', err.message);
    }
  });
}

// ---- Controllers ----

// GET /api/hotels?title=&minPrice=&maxPrice=&limit=&offset=
async function getHotels(req, res) {
  try {
    const { title, minPrice, maxPrice } = req.query;
    const limit = Number(req.query.limit ?? 6);
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50 ||
        !Number.isSafeInteger(offset) || offset < 0) {
      return res.status(400).json({ error: 'Limit must be 1 to 50 and offset must be a non-negative integer' });
    }
    if (title !== undefined && typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be text' });
    }
    for (const value of [minPrice, maxPrice]) {
      if (value !== undefined && value !== '' &&
          (typeof value !== 'string' || !value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0)) {
        return res.status(400).json({ error: 'Price filters must be non-negative numbers' });
      }
    }
    if (minPrice !== undefined && minPrice !== '' && maxPrice !== undefined && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
      return res.status(400).json({ error: 'Minimum price cannot exceed maximum price' });
    }

    const conditions = [];
    const values = [];
    let idx = 1;

    if (title && title.trim()) {
      conditions.push(`title ILIKE $${idx++}`);
      values.push(`%${title.trim()}%`);
    }
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
      conditions.push(`price >= $${idx++}`);
      values.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
      conditions.push(`price <= $${idx++}`);
      values.push(Number(maxPrice));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int AS total FROM hotels ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    const dataQuery = `
      SELECT id, title, description, latitude, longitude, price, image_path, created_at, updated_at
      FROM hotels
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const dataValues = [...values, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);

    res.status(200).json({
      data: dataResult.rows,
      pagination: { total, limit, offset },
    });
  } catch (err) {
    console.error('getHotels error:', err);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
}

// GET /api/hotels/:id
async function getHotelById(req, res) {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid hotel id' });

    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error('getHotelById error:', err);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
}

// POST /api/hotels
async function createHotel(req, res) {
  try {
    const errors = validateHotelInput(req.body, { requireAll: true });
    if (!req.file) errors.image = 'Please upload a hotel image';
    if (Object.keys(errors).length > 0) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const { title, description, latitude, longitude, price } = req.body;
    const imagePath = req.file ? (req.file.filename.startsWith('https://') ? req.file.filename : `/uploads/${req.file.filename}`) : null;

    const result = await pool.query(
      `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title.trim(), description.trim(), latitude, longitude, price, imagePath]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    console.error('createHotel error:', err);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
}

// PUT /api/hotels/:id
async function updateHotel(req, res) {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: 'Invalid hotel id' });
    }

    const existing = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const errors = validateHotelInput(req.body, { requireAll: true });
    if (Object.keys(errors).length > 0) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const { title, description, latitude, longitude, price } = req.body;
    let imagePath = existing.rows[0].image_path;

    if (req.file) {
      imagePath = (req.file.filename.startsWith('https://') ? req.file.filename : `/uploads/${req.file.filename}`);
    }

    const result = await pool.query(
      `UPDATE hotels
       SET title = $1, description = $2, latitude = $3, longitude = $4,
           price = $5, image_path = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title.trim(), description.trim(), latitude, longitude, price, imagePath, id]
    );

    if (req.file) deleteImageFile(existing.rows[0].image_path);
    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    console.error('updateHotel error:', err);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
}

// DELETE /api/hotels/:id
async function deleteHotel(req, res) {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid hotel id' });

    const result = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    deleteImageFile(result.rows[0].image_path);

    res.status(200).json({ message: 'Hotel deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error('deleteHotel error:', err);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
}

module.exports = { getHotels, getHotelById, createHotel, updateHotel, deleteHotel };
