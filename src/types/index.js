// src/types/index.js
// All shared type definitions as JSDoc for IDE support

/**
 * @typedef {Object} Season
 * @property {number} id
 * @property {number} year
 */

/**
 * @typedef {Object} Circuit
 * @property {number} id
 * @property {string} circuit_id
 * @property {string} name
 * @property {string} locality
 * @property {string} country
 * @property {number} lat
 * @property {number} long
 */

/**
 * @typedef {Object} Driver
 * @property {number} id
 * @property {string} driver_id
 * @property {string} code
 * @property {string} permanent_number
 * @property {string} given_name
 * @property {string} family_name
 * @property {string} date_of_birth
 * @property {string} nationality
 * @property {string|null} image_url
 * @property {string|null} bio
 */

/**
 * @typedef {Object} Constructor
 * @property {number} id
 * @property {string} constructor_id
 * @property {string} name
 * @property {string} nationality
 * @property {string|null} logo_url
 */

/**
 * @typedef {Object} Race
 * @property {number} id
 * @property {number} season_id
 * @property {number} round
 * @property {string} race_name
 * @property {string} date
 * @property {string} time
 * @property {number} circuit_id
 */

export {};
