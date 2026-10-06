/**
 * Unified API response helpers.
 * Every endpoint returns { success, message, data }.
 */

function success(res, { status = 200, message = 'OK', data = null } = {}) {
  return res.status(status).json({ success: true, message, data });
}

function fail(res, { status = 400, message = 'Error', data = null } = {}) {
  return res.status(status).json({ success: false, message, data });
}

module.exports = { success, fail };
