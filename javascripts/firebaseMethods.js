'use strict';

var FbAPI = (function(oldFirebase){
	oldFirebase.getSavedWeatherData = function(FBapiKeys, uid){
		return new Promise((resolve, reject)=>{
			$.ajax({
				method: "GET",
				url: `${FBapiKeys.databaseURL}/weather.json?orderBy="uid"&equalTo="${uid}"`
			}).then((response)=>{
				let items = [];
				Object.keys(response).forEach(function(key){
					response[key].id = key;
					items.push(response[key]);
				});
				resolve(items);
			}, (error)=>{
				reject(error);
			});
		});
	};

	oldFirebase.addWeatherData = function(FBapiKeys, newItem){
		return new Promise((resolve, reject)=>{
			$.ajax({
				method: "POST",
				url: `${FBapiKeys.databaseURL}/weather.json`,
				data:JSON.stringify(newItem),
				dataType:"json"
			}).then((response)=>{
				resolve(response);
			}, (error)=>{
				reject(error);
			});
		});
	};

	oldFirebase.deleteWeatherData = function(FBapiKeys, itemId){
		return new Promise((resolve, reject)=>{
			$.ajax({
				method: "DELETE",
				url: `${FBapiKeys.databaseURL}/weather/${itemId}.json`,
			}).then((response)=>{
				resolve(response);
			}, (error)=>{
				reject(error);
			});
		});
	};

	return oldFirebase;
})(FbAPI || {});