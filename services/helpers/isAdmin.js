function isAdmin(req) {
	if(
		typeof req.session.user == 'undefined' ||
		typeof req.session.user.admin == 'undefined' ||
		req.session.user.admin == false
	) {
		return false
	}
	return true
}

function isSU(user) {
	if(user.superUser === true) return true
	return false
}

module.exports = {
	isAdmin,
	isSU
}
