'use strict';

var revalidator = require('revalidator'),
	logger = require('../services/logger');

function validate(schemaName) {
	return function(req, res, next) {
		var schema = SCHEMAS[schemaName];
		var result = revalidator.validate(req, schema, {
			cast: true
		});

		if(!result.valid) {
			logger.info('validation middleware result %j', result);
			return next(new Error('validation error'));
		}

		return next();
	}
}

function bodySchemaFactory(bodyProperties) {
	return {
		properties: {
			body: {
				type: 'object',
				required: true,
				properties: bodyProperties
			}
		}
	}
}

function paramsSchemaFactory(paramsProperties) {
	return {
		properties: {
			params: {
				type: 'object',
				required: true,
				properties: paramsProperties
			}
		}
	}
}

var SCHEMAS = {
	organization: bodySchemaFactory({
		email: {
			type: 'string',
			required: true,
			allowEmpty: false
		},
		password: {
			type: 'string',
			required: true,
			allowEmpty: false
		},
		name: {
			type: 'string',
			required: true,
			allowEmpty: false
		},
		location: {
			type: 'string',
			required: true,
			allowEmpty: false
		},
	})
};

module.exports = {
	validate: validate
};
