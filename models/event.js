const db = require("../config/db");

class Event {
  static async create({ name, description, date, start_time, end_time, venue }) {
    const [result] = await db.query(
      "INSERT INTO events (name, description, date, start_time, end_time, venue) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, date, start_time, end_time, venue]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM events ORDER BY date, start_time");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
    return rows[0];
  }

  static async update(id, data) {
    const { name, description, date, start_time, end_time, venue } = data;
    await db.query(
      "UPDATE events SET name=?, description=?, date=?, start_time=?, end_time=?, venue=? WHERE id=?",
      [name, description, date, start_time, end_time, venue, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM events WHERE id = ?", [id]);
  }
}

module.exports = Event;