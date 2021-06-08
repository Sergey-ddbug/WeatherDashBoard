var baseURLCity = "https://api.openweathermap.org/data/2.5/weather";
var baseURLUvi = "https://api.openweathermap.org/data/2.5/uvi";
var baseURLForecast = "https://api.openweathermap.org/data/2.5/forecast";
var baseURLIcon = "http://openweathermap.org/img/wn/";
var urlIconSuffix = "@2x.png";
var apiKey = "0f6e2259330e30a75efb14a4aaa515ba";
var appIDParam = "APPID";
var queryParam = "q";
var firstParam = "lat";
var lonParam = "lon";
var countParam = "cnt";
var count = 5;
var city = "";

$("#search_button").on("click", function () {
  city = $("#city_input").val();
  saveCitySearch(city);
  getCityInfo(city);
});

function getCityInfo(city) {
  var cityURL = `${baseURLCity}?${queryParam}=${city}&${appIDParam}=${apiKey}`;
  var forecastURL = `${baseURLForecast}?${queryParam}=${city}&${appIDParam}=${apiKey}`;
  var cityInfo = {};
  var UVIInfo = {};
  var forecastInfo = {};
  var promise = api.call(cityURL, "GET");
  promise.then(function (result) {
    cityInfo = result;
    var first = cityInfo.coord.lon;
    var second = cityInfo.coord.lat;
    var uviURL = `${baseURLUvi}?${lonParam}=${first}&${firstParam}=${second}&${appIDParam}=${apiKey}`;
    var promise = api.call(uviURL, "GET");
    promise.then(function (result) {
      UVIInfo = result;
      populateCurrentWeather(cityInfo, UVIInfo);
    });
  });
  var promise = api.call(forecastURL, "GET");
  promise.then(function (result) {
    forecastInfo = result;
    populateForecast(forecastInfo);
  });
}

function populateCurrentWeather(cityInfo, UVIInfo) {
  var cityName = cityInfo.name;
  var date = moment.unix(cityInfo.dt).format("MM/DD/YYYY");
  var temp = Math.round(cityInfo.main.temp - 273.15, 0);
  var humidity = cityInfo.main.humidity + "%";
  var windSpeed = cityInfo.wind.speed;
  var uvi = UVIInfo.value;
  var icon = cityInfo.weather[0].icon;
  $("#city_name").text(`${cityName} ${date}`);
  $("#city_name").append(
    $("<img>").attr("src", `${baseURLIcon}${icon}${urlIconSuffix}`)
  );
  $("#temp").text(`Temperature: ${temp}°F`);
  $("#hum").text(`Humidity: ${humidity}`);
  $("#wind").text(`Wind Speed: ${windSpeed} m/s`);
  $("#uvi").text(`${uvi}`);
  uvi < 3
    ? $("#uvi").attr("class", "badge badge-pill badge-success")
    : uvi < 8
    ? $("#uvi").attr("class", "badge badge-pill badge-warning")
    : $("#uvi").attr("class", "badge badge-pill badge-danger");
}

function populateForecast(forecastInfo) {
  var points = [4, 12, 20, 28, 36];
  for (i in points) {
    var cardID = "forecast_" + (parseInt(i) + 1);
    var date = moment
      .unix(forecastInfo.list[points[i]].dt)
      .format("MM/DD/YYYY");
    var temp = Math.round(
      (forecastInfo.list[points[i]].main.temp - 273.15) * 1.8 + 32
    );
    var humidity = forecastInfo.list[points[i]].main.humidity + "%";
    var icon = forecastInfo.list[points[i]].weather[0].icon;
    $(`#${cardID}`).children(".f_city_name").text(date);
    $(`#${cardID}`).children(".f_temp").text(`Temp: ${temp}°F`);
    $(`#${cardID}`).children(".f_hum").text(`Humidity: ${humidity}`);
    $(`#${cardID}`).children(".f_image").children("img").remove();
    $(`#${cardID}`)
      .children(".f_image")
      .append($("<img>").attr("src", `${baseURLIcon}${icon}${urlIconSuffix}`));
  }
}

function saveCitySearch(city) {
  citiesList = loadFromLocalStorage("cities");
  if (citiesList) {
    for (c of citiesList) {
      if (c.name === city) {
        return;
      }
    }
  }
  appendCity(city);
  cityObj = { name: city };
  updateLocalStorage("cities", cityObj);
}

function updateLocalStorage(key, newItem) {
  storedItem = JSON.parse(window.localStorage.getItem(key));
  if (!storedItem) {
    storedItem = [newItem];
  } else {
    storedItem.push(newItem);
  }
  window.localStorage.setItem(key, JSON.stringify(storedItem));
}

function loadFromLocalStorage(key) {
  storedItem = JSON.parse(window.localStorage.getItem(key));
  if (!storedItem) {
    return;
  } else {
    return storedItem;
  }
}

function appendCity(city) {
  $("#saved_search").append(
    `<li class="list-group-item city_button" id="city_${city}">${city}</li>`
  );
  $("li[id^='city_']")
    .unbind()
    .click(function () {
      city = $(this).text();
      getCityInfo(city);
    });
}

function preLoadSearchHistory() {
  citiesList = loadFromLocalStorage("cities");
  if (!citiesList) {
    return;
  } else {
    for (c of citiesList) {
      appendCity(c.name);
    }
  }
}
var api = (function () {
  return {
    url: "",
    method: "",
    result: {},
    call: function (url, method) {
      this.url = url;
      this.method = method;
      return $.ajax({
        url: this.url,
        method: this.method,
      });
    },
  };
})();

preLoadSearchHistory();
