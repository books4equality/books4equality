function sanitize(object) {
    var result = JSON.parse(JSON.stringify(object)); // tricky but efficient way to clone an object
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