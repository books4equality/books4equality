function sanitize(object) {
    var result = Object.assign({}, object);
    for (var key in result) {
        if (result[key].trim) {
            result[key] = result[key].trim();
        }
    }

    return result;
}

module.exports = {
	sanitize: sanitize
};