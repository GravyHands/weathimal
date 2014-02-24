$(document).ready(function () {
    hideError();
});

function search_weather() {

    var user_input = $('#search_form').find('input[type="text"]').val();
    var start = findPostal(user_input);
    if (start >= 0) {

        zip = user_input.substr(start, 5);   // assumes postal is length 5, will need to change for other countries
        var queryAddress = getWeatherQueryAddress([zip]);
        showMsg('loading', false);
        ajaxWeather(queryAddress);
    }
    else {
        showMsg('input not recognized as zip code',true);
    }
    return false;
}

//  A few tests failed to find non-American postal codes in the weather API I am using
//      so this will only look for American postal codes in the user's input
var findPostal = function (string) {
    var regex = /^\d{5}(?![0-9a-zA-Z])/;
    return string.search(regex);
};

var getWeatherQueryAddress = function (array) {
    var ret = "http://api.wunderground.com/api/50e211740ae77b53/forecast/q"
    for (var i = 0, e = array.length; i < e; ++i) {
        ret += "/" + array[i];
    }
    ret += ".json";
    return ret;
};

var ajaxWeather = function (address) {
    $.ajax({
        url: address,
        dataType: "jsonp",
        success: parseJSON,
        error: function () {
            alert('error');
            showMsg('error retrieving weather data',true);
        }
    });
};

var parseJSON = function (response) {
    if (response.response.error) {
        showMsg('zip code not recognized', true);
        return;
    }
    $('#search_bar').removeClass('found');
    $('#search_bar').addClass('found');
    hideMsg();
    var forecast = response.forecast.txt_forecast.forecastday;
    if (forecast.length === 0) {
        return "error";
    }
    var days = [forecast[0]];
    for (var i = 1, e = forecast.length; i < e; ++i) {
        if (forecast[i].title.toLowerCase().search("night") === -1) {
            days.push(forecast[i]);
        }
    }
    setupWeatherDivs(days, 3);
};

var setupWeatherDivs = function (forecast_days, num_days) {
    var is_sharknado = false;
    $('#weather_divs').empty();
    for (var i = Math.min(forecast_days.length, num_days)-1; i >= 0; --i) {
        var weatherClass = "";
        if($.inArray(Number(zip),LAzipCodes) !== -1) {
            weatherClass = 'sharknado';
            is_sharknado = true;
        }
        else {
            weatherClass = getWeatherClass(forecast_days[i].icon);
        }
        var imgSrc = getWeatherImage(weatherClass);
        $('#weather_divs').append(retWeatherDiv(weatherClass, imgSrc, getWeekday(forecast_days[i].title)));
        
    }
    if (is_sharknado) {
        addDescription('sharknado');
    }
    else {
        addDescription(getWeatherClass(forecast_days[0].icon));
    }
}

var addDescription = function (weatherClass) {
    $('#weather_divs').append(
        "<div class='description'>\
            <div class='positioner'>\
                <p class='description_text'>"+getDescriptiveMessage(weatherClass)+"</p>\
            </div>\
        </div>");
}

var getWeatherClass = function (weatherString) {
    switch(weatherString)
    {
        case 'tstorms':
        case 'rain':
        case 'chancerain':
        case 'chancetstorms':
            return 'rain';

        case 'flurries':
        case 'snow':
        case 'chanceflurries':
        case 'chancesnow':
            return 'snow';

        case 'clear':
        case 'sunny':
        case 'mostlysunny':
        case 'partlysunny':
            return 'sunny';

        case 'cloudy':
        case 'fog':
        case 'hazy':
        case 'mostlycloudy':
        case 'partlycloudy':
            return 'cloudy';

        case 'sleet':
        case 'icy':
        case 'chancesleet':
            return 'icy';

        default:
            return 'none';
    }
}

var getWeatherImage = function (weatherClass) {
    switch (weatherClass) {
        case 'rain':
            return "images/rain_icon.png";
        case 'snow':
            return "images/snow_icon.png";
        case 'sunny':
            return "images/sun_icon3.png";
        case 'cloudy':
            return "images/cloudy_icon.png";
        case 'icy':
            return "images/snow_icon.png";
        case 'sharknado':
            return "images/sharknado_icon.png";
        default:
            break;
    }
    return 'none';
}

var getDescriptiveMessage = function (weatherClass) {
    switch (weatherClass) {
        case 'rain':
            return 'stormy cloud.';
        case 'snow':
            return 'fluffy whiteness.';
        case 'sunny':
            return 'happy sky.';
        case 'cloudy':
            return 'sun is hiding.';
        case 'icy':
            return 'brrrrr.';
        case 'sharknado':
            return 'sharknado.';
        default:
            return "def";
    }
}

var getWeekday = function (weekday) {
    switch(weekday.toLowerCase())
    {
        case 'monday':
            return 'mon';
        case 'tuesday':
            return 'tues';
        case 'wednesday':
            return 'wed';
        case 'thursday':
            return 'thurs';
        case 'friday':
            return 'fri';
        case 'saturday':
            return 'sat';
        case 'sunday':
            return 'sun';
    }
    return '?';
}

var retWeatherDiv = function (classname, imgname, weekday) {
    var ret =
            "<div class=\"weather " + classname + "\">\
                <p class=\"weekday\">"+weekday+"</p>\
                <div class=\"positioner\">\
                    <img src=\"" + imgname + "\" />\
                </div>\
            </div>";
    return ret;
};

var showMsg = function (msg,is_error) {
    $('#error_msg').removeClass('error');
    if (is_error) {
        $('#error_msg').addClass('error');
    }
    $('#error_msg').html(msg);
    $('#error_msg').show();
}

var hideMsg = function () {
    $('#error_msg').hide();
}


//  Obviously not the best way, but I was running out of time.
//      And this was clearly a feature that needed to be added.
var LAzipCodes = [90001, 90002, 90003, 90004, 90005, 90006, 90007, 90008, 90010, 90011, 90012, 90013,
    90014, 90015, 90016, 90017, 90018, 90019, 90020, 90021, 90023, 90024, 90025, 90026, 90027, 90028,
    90029, 90031, 90032, 90033, 90034, 90035, 90036, 90037, 90038, 90039, 90041, 90042, 90043, 90044,
    90045, 90046, 90047, 90048, 90049, 90056, 90057, 90058, 90059, 90061, 90062, 90063, 90064, 90065,
    90066, 90067, 90068, 90069, 90071, 90077, 90079, 90089, 90090, 90094, 90095, 90210, 90212, 90230,
    90232, 90247, 90248, 90272, 90275, 90290, 90291, 90292, 90293, 90402, 90405, 90501, 90502, 90710,
    90717, 90731, 90732, 90744, 90745, 90810, 90813, 91030, 91040, 91042, 91105, 91214, 91303, 91304,
    91306, 91307, 91311, 91316, 91324, 91325, 91326, 91330, 91331, 91335, 91340, 91342, 91343, 91344,
    91345, 91352, 91356, 91364, 91367, 91371, 91401, 91402, 91403, 91405, 91406, 91411, 91423, 91436,
    91504, 91505, 91601, 91602, 91604, 91605, 91606, 91607, 91608];