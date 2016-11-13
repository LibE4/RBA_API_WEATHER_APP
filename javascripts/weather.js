"use strict";

let apiKeys = {}, time, cityZip = "37069", nDays, dataInDOM;
let FBapiKeys = {};
let uid = "";
let weatherDay = {};
let cityName = "";
let provider = new firebase.auth.GoogleAuthProvider();

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
    dataInDOM += `<td><button class="btn btn-success col-xs-6 save-weather">SAVE</button></td>`;
  dataInDOM += "</tr>";
  $("#table-caption").html("Weather daily forecast (metric):");
  $("#dataDisplay").html(dataInDOM);
} // end of currentDayDisplay

function multiDayDisplay(dayData) {
  for(let i = 1; i < dayData.length; i++){
    time += 24*60*60*1000;
    dataInDOM += "<tr>";
      dataInDOM += `<td>${cityName}</td>`;
      dataInDOM += `<td>${new Date(time).toDateString()}</td>`;
      dataInDOM += `<td>${dayData[i].temp.day}</td>`;
      dataInDOM += `<td>${dayData[i].humidity}</td>`;
      dataInDOM += `<td>${dayData[i].pressure}</td>`;
      dataInDOM += `<td>${dayData[i].speed}</td>`;
      dataInDOM += `<td><button class="btn btn-success col-xs-6 save-weather">SAVE</button></td>`;
    dataInDOM += "</tr>";
  }
  $("#table-caption").html("Weather daily forecast (metric):");
  $("#dataDisplay").html(dataInDOM);
} // end of multiDayDisplay

function savedWeatherDisplay(weatherData) {
  $("#dataDisplay").html("");
  dataInDOM = "";
  for(let i = 0; i < weatherData.length; i++){
    dataInDOM += "<tr>";
      dataInDOM += `<td>${weatherData[i].city}</td>`;
      dataInDOM += `<td>${weatherData[i].date}</td>`;
      dataInDOM += `<td>${weatherData[i].temperature}</td>`;
      dataInDOM += `<td>${weatherData[i].humidity}</td>`;
      dataInDOM += `<td>${weatherData[i].airpressure}</td>`;
      dataInDOM += `<td>${weatherData[i].windspeed}</td>`;
      dataInDOM += `<td><button class="btn btn-danger col-xs-6 delete-weather" data-fbid="${weatherData[i].id}">DELETE</button></td>`;
    dataInDOM += "</tr>";
  }
  $("#table-caption").html("Saved weather data:");
  $("#dataDisplay").html(dataInDOM);
} // end of savedWeatherDisplay

function isValidUSZip(cityZip) {
   return /^\d{5}(-\d{4})?$/.test(cityZip);
}

function getDataByZip(){
	nDays = $('#type-select').val();
	if(isValidUSZip(cityZip)){
		getCurretWeather(cityZip).then((weather)=>{
		  currentDayDisplay(weather);
		  if(nDays !== ""){
        cityName = weather.name;
			  getMultiDayWeather(cityName, nDays).then((dayData)=>{
			  	multiDayDisplay(dayData);
			  });
		  }
		});
	}
}

function createLogoutButton() {
  FbAPI.getUser(FBapiKeys, uid).then(function(userResponse) {
    $('#logout-container').html('');
    $('#logout-container').removeClass('hide');
    let currentUsername = userResponse.username;
    let logoutLink = `<a href="" id="logoutLink">Logout ${currentUsername}</a>`;
    $('#logout-container').append(logoutLink);
    $('#view-saved-movies-link').removeClass('hide');
  });
}

$(document).ready(function(){
	FbAPI.firebaseCredentials().then(function(keys){
		console.log("FBkeys", keys);
		FBapiKeys = keys;
		firebase.initializeApp(FBapiKeys);
  });

  $('#googleLoginButton').on('click', function() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("user", user);
      uid = user.uid;
      // for logout button
      $('#logout-container').html('');
      $('#logout-container').removeClass('hide');
      let currentUsername = user.displayName;
      let logoutLink = `<a href="" id="logoutLink">Logout ${currentUsername}</a>`;
      $('#logout-container').append(logoutLink);
      $('#view-saved-movies-link').removeClass('hide');
      // for view change
      $('#login-container').addClass('hide');
      $('#nav-weather').removeClass('hide');
      $('#main-weather').removeClass('hide');
    }).catch(function(error) {
      // Handle Errors here.
      console.log("user error", error);
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  });


  $('#registerButton').on('click', function() {
    // let email = "b@b.com";
    // let password = "123456";
    // let username = "bb";
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let username = $('#inputUsername').val();
    let user = {
      email: email,
      password: password
    };
    FbAPI.registerUser(user).then(function(registerResponse) {
      let newUser = {
        username,
        uid: registerResponse.uid
      };
      return FbAPI.addUser(FBapiKeys, newUser);
    }).then(function(userResponse) {
      return FbAPI.loginUser(user);
    }).then(function(loginResponse) {
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#nav-weather').removeClass('hide');
      $('#main-weather').removeClass('hide');

    });
  });

 $('#loginButton').on('click', function() {
    // let email = "b@b.com";
    // let password = "123456";
    // let username = "bb";
    let email = $('#inputEmail').val();
    let password = $('#inputPassword').val();
    let user = {
      email: email,
      password: password
    };

    FbAPI.loginUser(user).then(function(loginResponse) {
      uid = loginResponse.uid;
      createLogoutButton();
      $('#login-container').addClass('hide');
      $('#nav-weather').removeClass('hide');
      $('#main-weather').removeClass('hide');
    });
  });

  $("#logout-container").on('click', '#logoutLink', function(e) {
    e.preventDefault();
    FbAPI.logoutUser();
    uid = "";
    $('#cityZip').val('');
    $('#dataDisplay').html('');
    $('#inputEmail').val('');
    $('#inputPassword').val('');
    $('#inputUsername').val('');
    $('#login-container').removeClass('hide');
    $('#nav-weather').addClass('hide');
    $('#main-weather').addClass('hide');
    $('#logout-container').addClass('hide');
  });

  $(document).on('click', '.save-weather', (e) => {
    e.preventDefault();
    let tds = $(e.target).closest("tr").find("td");
    weatherDay.city = tds[0].innerHTML;
    weatherDay.date = tds[1].innerHTML;
    weatherDay.temperature = tds[2].innerHTML;
    weatherDay.humidity = tds[3].innerHTML;
    weatherDay.airpressure = tds[4].innerHTML;
    weatherDay.windspeed = tds[5].innerHTML;
    weatherDay.uid = uid;
    FbAPI.addWeatherData(FBapiKeys, weatherDay);
  });

  $(document).on('click', '.delete-weather', (e) => {
    e.preventDefault();
    let itemId = $(e.target).data("fbid");
    FbAPI.deleteWeatherData(FBapiKeys, itemId).then(function(){
      FbAPI.getSavedWeatherData(FBapiKeys, uid).then(function(weatherData){ 
        savedWeatherDisplay(weatherData);
      });
    });
  });

  $(document).on('click', '#view-saved-weather', (e) => {
    e.preventDefault();
    FbAPI.getSavedWeatherData(FBapiKeys, uid).then(function(weatherData){ 
      console.log("weatherData", weatherData);
      savedWeatherDisplay(weatherData);
    });
  });

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






