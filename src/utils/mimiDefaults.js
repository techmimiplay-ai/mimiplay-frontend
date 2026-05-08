/**
 * Mimi Default Configuration
 * Ensures consistent defaults across the entire application
 */

export const MIMI_DEFAULTS = {
  DRESS: 'overall',
  BACKGROUND: 'default',
  EXPRESSION: 'neutral'
};

/**
 * Get the default dress for Mimi
 * @returns {string} The default dress key
 */
export const getDefaultDress = () => MIMI_DEFAULTS.DRESS;

/**
 * Get the default background for Mimi
 * @returns {string} The default background key
 */
export const getDefaultBackground = () => MIMI_DEFAULTS.BACKGROUND;

/**
 * Get the default expression for Mimi
 * @returns {string} The default expression key
 */
export const getDefaultExpression = () => MIMI_DEFAULTS.EXPRESSION;

/**
 * Resolve outfit with fallback to default
 * @param {string} outfit - The outfit to use
 * @returns {string} The outfit or default if not provided
 */
export const resolveOutfit = (outfit) => outfit || getDefaultDress();

/**
 * Resolve background with fallback to default
 * @param {string} background - The background to use
 * @returns {string} The background or default if not provided
 */
export const resolveBackground = (background) => background || getDefaultBackground();

export default MIMI_DEFAULTS;