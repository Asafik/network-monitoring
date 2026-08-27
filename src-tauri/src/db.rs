use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistoryPoint {
    pub time: String,
    pub timestamp: i64,
    #[serde(rename = "downloadBps")]
    pub download_bps: f64,
    #[serde(rename = "uploadBps")]
    pub upload_bps: f64,
    #[serde(rename = "pingMs")]
    pub ping_ms: f64,
    #[serde(rename = "jitterMs")]
    pub jitter_ms: f64,
    #[serde(rename = "packetLoss")]
    pub packet_loss: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IncidentLog {
    pub id: String,
    pub timestamp: String,
    #[serde(rename = "type")]
    pub incident_type: String,
    pub severity: String,
    pub message: String,
    pub duration: Option<String>,
}

pub struct Database {
    db_path: std::path::PathBuf,
}

impl Database {
    pub fn new(app_dir: &Path) -> Result<Self> {
        let db_path = app_dir.join("network_monitor.db");
        let conn = Connection::open(&db_path)?;

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                download_bps REAL NOT NULL,
                upload_bps REAL NOT NULL,
                ping_ms REAL NOT NULL,
                jitter_ms REAL NOT NULL,
                packet_loss REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                incident_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                duration TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics_history(timestamp);
            ",
        )?;

        Ok(Database { db_path })
    }

    fn get_conn(&self) -> Result<Connection> {
        Connection::open(&self.db_path)
    }

    pub fn insert_metric(
        &self,
        timestamp: i64,
        download_bps: f64,
        upload_bps: f64,
        ping_ms: f64,
        jitter_ms: f64,
        packet_loss: f64,
    ) -> Result<()> {
        let conn = self.get_conn()?;
        conn.execute(
            "INSERT INTO metrics_history (timestamp, download_bps, upload_bps, ping_ms, jitter_ms, packet_loss)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![timestamp, download_bps, upload_bps, ping_ms, jitter_ms, packet_loss],
        )?;

        // Maintain max 10000 records
        conn.execute(
            "DELETE FROM metrics_history WHERE id IN (
                SELECT id FROM metrics_history ORDER BY id DESC LIMIT -1 OFFSET 10000
            )",
            [],
        )?;

        Ok(())
    }

    pub fn insert_incident(
        &self,
        incident_type: &str,
        severity: &str,
        message: &str,
        duration: Option<&str>,
    ) -> Result<()> {
        let conn = self.get_conn()?;
        let now_str = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        conn.execute(
            "INSERT INTO incidents (timestamp, incident_type, severity, message, duration)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![now_str, incident_type, severity, message, duration],
        )?;
        Ok(())
    }

    pub fn get_recent_history(&self, limit: usize) -> Result<Vec<HistoryPoint>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT timestamp, download_bps, upload_bps, ping_ms, jitter_ms, packet_loss
             FROM metrics_history
             ORDER BY timestamp DESC
             LIMIT ?1",
        )?;

        let rows = stmt.query_map(params![limit as i64], |row| {
            let ts: i64 = row.get(0)?;
            let dt = chrono::DateTime::from_timestamp_millis(ts)
                .map(|d| d.with_timezone(&chrono::Local).format("%H:%M:%S").to_string())
                .unwrap_or_else(|| "00:00:00".to_string());

            Ok(HistoryPoint {
                time: dt,
                timestamp: ts,
                download_bps: row.get(1)?,
                upload_bps: row.get(2)?,
                ping_ms: row.get(3)?,
                jitter_ms: row.get(4)?,
                packet_loss: row.get(5)?,
            })
        })?;

        let mut points = Vec::new();
        for point in rows {
            if let Ok(p) = point {
                points.push(p);
            }
        }
        points.reverse();
        Ok(points)
    }

    pub fn get_recent_incidents(&self, limit: usize) -> Result<Vec<IncidentLog>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, incident_type, severity, message, duration
             FROM incidents
             ORDER BY id DESC
             LIMIT ?1",
        )?;

        let rows = stmt.query_map(params![limit as i64], |row| {
            let id_num: i64 = row.get(0)?;
            Ok(IncidentLog {
                id: format!("inc-{}", id_num),
                timestamp: row.get(1)?,
                incident_type: row.get(2)?,
                severity: row.get(3)?,
                message: row.get(4)?,
                duration: row.get(5)?,
            })
        })?;

        let mut incidents = Vec::new();
        for inc in rows {
            if let Ok(i) = inc {
                incidents.push(i);
            }
        }
        Ok(incidents)
    }
}
