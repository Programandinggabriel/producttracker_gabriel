const { pool } = require('../config/db');

const ALLOWED_NOTIFIED_STATUSES = [
    'PENDING',
    'FAILED',
    'SEND'
]

const getAlertActivationByAlertId = async (id, status=[]) => {
    const query = `SELECT id,
                          alert_id,
                          history_id,
                          notified_status
                     FROM price_alerts_activation
                   WHERE alert_id = $1
                     AND notified_status = ANY($2)`;
    const values = [
        id,
        status
    ];

    const { rows } = await pool.query(query, values);

    return rows;
}

const getAlertActivationByAlertAndHistoryId = async (alertId, historyId) => {
    const query = `SELECT id,
                          alert_id,
                          history_id,
                          notified_status
                     FROM price_alerts_activation
                   WHERE alert_id = $1
                     AND history_id = $2`;
    const values = [
        alertId,
        historyId
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
}

const createAlertActivation = async (
    alertId,
    historyId
) => {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4().replace(/-/g, '').slice(0, 10);

    const query = `
        INSERT INTO price_alerts_activation(
	        id, alert_id, history_id)
	    VALUES ($1, $2, $3)
        RETURNING *`;
    const values = [
        id,
        alertId,
        historyId
    ]

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const setStatusAlertActivation = async (id, status) => {
    const query = `UPDATE price_alerts_activation
                    SET notified_status = $1
                   WHERE id = $2
                   RETURNING *`;
    const values = [status, id];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const setNotifiedAtAlertActivation = async (id) => {
    const query = `UPDATE price_alerts_activation
                    SET notified_at = NOW()
                   WHERE id = $1
                   RETURNING *`;
    const values = [id];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

module.exports = {
    getAlertActivationByAlertId,
    getAlertActivationByAlertAndHistoryId,
    createAlertActivation,
    setStatusAlertActivation,
    setNotifiedAtAlertActivation
}