const db = require("../config/db");

class Event {
  static async create({ name, description, date, start_time, end_time, venue }) {
    const result = await db.query(
      "INSERT INTO events (name, description, date, start_time, end_time, venue) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [name, description, date, start_time, end_time, venue]
    );
    return result.rows[0].id;
  }

  static async getAll() {
    const result = await db.query("SELECT * FROM events ORDER BY date, start_time");
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query("SELECT * FROM events WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, description, date, start_time, end_time, venue } = data;
    await db.query(
      "UPDATE events SET name=$1, description=$2, date=$3, start_time=$4, end_time=$5, venue=$6 WHERE id=$7",
      [name, description, date, start_time, end_time, venue, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM events WHERE id = $1", [id]);
  }
}

module.exports = Event;