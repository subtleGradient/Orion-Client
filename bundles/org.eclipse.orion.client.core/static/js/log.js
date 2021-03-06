/*******************************************************************************
 * Copyright (c) 2009, 2010 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors: IBM Corporation - initial API and implementation
 *******************************************************************************/
 
"use strict";
 
/**
 * @namespace The global container for eclipse APIs.
 */ 
var eclipse = eclipse || {};

/**
 * Log Service
 * @class Services for logging
 */
eclipse.LogService = function(serviceRegistry) {
	this._serviceRegistry = serviceRegistry;
	this._serviceRegistration = serviceRegistry.registerService("ILogService", this);
};
 
eclipse.LogService.prototype = {
	info : function(msg) {
		// TODO temporary implementation uses status line
		// obviously not the real answer
		this._serviceRegistry.getService("IStatusReporter").then(function(service) {
			service.setMessage("LOG: " + msg);
		});
	}
};