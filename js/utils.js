/**
 * 
 * @param {string} selector 
 * @returns Element | null
 */
function $(selector) {
    return document.querySelector(selector);
}

export { $ };