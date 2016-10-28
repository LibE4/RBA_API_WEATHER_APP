"use strict";

let apiKeys = {}, time, cityZip, nDays, dataInDOM;
let getCurretWeather = (searchText)=>{
	return new Promise((resolve, reject)=>{
		$.ajax({
			method:'GET',
			url:'apiKeys.json'
		}).then((response)=>{
			apiKeys = response;

			$.ajax({
				method:'GET',
				url:`http://api.openweathermap.org/data/2.5/weather?zip=${searchText},us&units=metric&APPID=${apiKeys.APPID}`
			}).then((response)=>{
				// console.log("response", response);
				resolve(response);
			},(errorResponse)=>{
				reject(errorResponse);
			});

		},(errorResponse)=>{
			console.log("errorResponse", errorResponse);
		});
	});
};

let getMultiDayWeather = (cityName, nDays)=>{
	return new Promise((resolve, reject)=>{
		$.ajax({
			method:'GET',
			url:'apiKeys.json'
		}).then((response)=>{
			apiKeys = response;

			$.ajax({
				method:'GET',
				url:`http://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&units=metric&cnt=${nDays}&APPID=${apiKeys.APPID}`
			}).then((response)=>{
				resolve(response.list);
			},(errorResponse)=>{
				reject(errorResponse);
			});

		},(errorResponse)=>{
			console.log("errorResponse", errorResponse);
		});
	});
};
function currentDayDisplay(weatherData) {
	time = Date.now();
  dataInDOM = "";
  dataInDOM += "<tr>";
    dataInDOM += `<td>${weatherData.name}</td>`;
    dataInDOM += `<td>${(new Date(time)).toDateString()}</td>`;
    dataInDOM += `<td>${weatherData.main.temp}</td>`;
    dataInDOM += `<td>${weatherData.main.humidity}</td>`;
    dataInDOM += `<td>${weatherData.main.pressure}</td>`;
    dataInDOM += `<td>${weatherData.wind.speed}</td>`;
  dataInDOM += "</tr>";
  $("#dataDisplay").html(dataInDOM);
} // end of currentDayDisplay

function multiDayDisplay(dayData) {
  for(let i = 1; i < dayData.length; i ++){
  	time += 24*60*60*1000;
	  dataInDOM += "<tr>";
	    dataInDOM += `<td></td>`;
	    dataInDOM += `<td>${new Date(time).toDateString()}</td>`;
	    dataInDOM += `<td>${dayData[i].temp.day}</td>`;
	    dataInDOM += `<td>${dayData[i].humidity}</td>`;
	    dataInDOM += `<td>${dayData[i].pressure}</td>`;
	    dataInDOM += `<td>${dayData[i].speed}</td>`;
	  dataInDOM += "</tr>";
	}
  $("#dataDisplay").html(dataInDOM);
} // end of multiDayDisplay

function isValidUSZip(cityZip) {
   return /^\d{5}(-\d{4})?$/.test(cityZip);
}

function getDataByZip(){
	nDays = $('#type-select').val();
	if(isValidUSZip(cityZip)){
		getCurretWeather(cityZip).then((weather)=>{
		  currentDayDisplay(weather);
		  if(nDays !== ""){
			  getMultiDayWeather(weather.name, nDays).then((dayData)=>{
			  	multiDayDisplay(dayData);
			  });
		  }
		});
	}
	
}

$(document).ready(function(){
	$("#cityZip").on("keyup", (e)=>{
		cityZip = $("#cityZip").val();
		if(e.keyCode === 13){
			getDataByZip();
		}
	});
	$('#submit').on('click', (e)=>{
		e.preventDefault();
		getDataByZip();
	});
	$('#type-select').on('change', ()=>{
		getDataByZip();
	});

});






