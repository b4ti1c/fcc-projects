var iconMap = {
    '01d': 'wi-day-sunny',
    '02d': 'wi-day-cloudy',
    '03d': 'wi-cloud',
    '04d': 'wi-cloudy',
    '09d': 'wi-sprinkle',
    '10d': 'wi-day-sprinkle',
    '11d': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '50d': 'wi-fog',
    '01n': 'wi-night-clear',
    '02n': 'wi-night-alt-cloudy',
    '03n': 'wi-cloud',
    '04n': 'wi-cloudy',
    '09n': 'wi-sprinkle',
    '10n': 'wi-night-sprinkle',
    '11n': 'wi-thunderstorm',
    '13n': 'wi-snow',
    '50n': 'wi-fog'
}


var pictureMap = {
    '01d': 'http://lorempixel.com/1280/720/nature/5',
    '02d': 'http://lorempixel.com/1280/720/nature/8',
    '03d': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Scattering_of_clouds.jpg',
    '04d': 'https://mbman.files.wordpress.com/2014/05/cloudy.jpg',
    '09d': 'http://40.media.tumblr.com/a539e5fa9a3b691de76a612823174ffe/tumblr_n9j6ujoYCw1tducb4o1_500.jpg',
    '10d': 'http://commonwealthmagazine.org/wp-content/uploads/sites/2/2015/09/rainy_day_raining_cold_abstract_1600x1200_hd-wallpaper-1557994.jpg',
    '11d': 'https://i.ytimg.com/vi/m89qAa9HNno/maxresdefault.jpg',
    '13d': 'http://wallpaperswide.com/download/snowing_2-wallpaper-1280x768.jpg',
    '50d': 'http://weknowyourdreamz.com/images/fog/fog-06.jpg',
    '01n': 'http://briansolomon.com/trackingthelight/wp-content/uploads/2013/07/Palmer-station-in-Fog-at-night_Brian_Solomon1985.jpg',
    '02n': 'http://rezalution.ca/images/20070119_cloudy_night.jpg',
    '03n': 'http://pre15.deviantart.net/3094/th/pre/f/2013/234/3/8/full_moon___cloudy_night__magic_by_radutataru-d6j8z3m.jpg',
    '04n': 'http://pre15.deviantart.net/3094/th/pre/f/2013/234/3/8/full_moon___cloudy_night__magic_by_radutataru-d6j8z3m.jpg',
    '09n': 'http://img01.deviantart.net/a027/i/2012/196/0/0/rainy_night_wallpaper_by_saintanlay-d57dmfg.png',
    '10n': 'http://img01.deviantart.net/a027/i/2012/196/0/0/rainy_night_wallpaper_by_saintanlay-d57dmfg.png',
    '11n': 'http://images5.fanpop.com/image/photos/24800000/Thunderstorms-thunderstorm-24879713-800-533.jpg',
    '13n': 'http://wallpaperstock.net/snowing-park-wallpapers_32068_1024x768.jpg',
    '50n': 'http://briansolomon.com/trackingthelight/wp-content/uploads/2013/07/Palmer-station-in-Fog-at-night_Brian_Solomon1985.jpg'
}


var openweather = 'http://api.openweathermap.org/data/2.5/weather';
var apiKey = 'a0bbc401d29647575dd7bbdf9515c3d4';
var metric = 'metric';
var latitude, longitude;
var weatherIconUrl = 'http://openweathermap.org/img/w/';


var getWeather = function() {
    return $.ajax({
        url: openweather,
        crossDomain: true,
        dataType: 'json',
        method: 'GET',
        data: {
            lat: latitude,
            lon: longitude,
            units: metric,
            APPID: apiKey
        }
    });
};


var showWeather = function(weatherData) {
    var location = weatherData.name + ', ' + weatherData.sys.country;
    var degrees = weatherData.main.temp.toFixed(1);
    var weatherIcon = weatherData.weather[0].icon;
    var weatherText = weatherData.weather[0].description[0].toUpperCase() + 
                      weatherData.weather[0].description.slice(1);

    $('location').html(location);
    $('#temp').html(degrees);
    $('weather-text').html(weatherText);
    $('weather-icon i').remove();
    $('weather-icon').html('<i class="wi ' + iconMap[weatherIcon] + '"></i>');
    $('background').css('background', 'url(' + pictureMap[weatherIcon] + ') no-repeat center center / cover');
}


navigator.geolocation.getCurrentPosition(function(pos){
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;

    getWeather()
        .then(showWeather);
}, function(err) {console.log(err)});


setInterval(function(){
    var time = new Date().toString().match(/(?:\s)\d\d:\d\d/)[0].slice(1);
    $('time').html(time);
}, 500);

$(function(){
    $('toggle').click(function(){
        metric = metric == 'metric' ? 'imperial' : 'metric';
        var unit = metric == 'metric' ? 'C' : 'F';
        var altMetric = metric == 'metric' ? 'F' : 'C';

        $('#unit').html(unit);
        $('#alt-metric').html(altMetric);

        getWeather()
            .then(showWeather);
    });
});
