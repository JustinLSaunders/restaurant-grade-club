String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};
var offsetValue = 0;
var endOfResults = 0;
//user is "finished typing," do something
var typingTimer;                //timer identifier
var doneTypingInterval = 1250;  //time in ms, 5 second for example
var $input = $('#user-input');
var $resultsContainer = $('#results-container');
//on keyup, start the countdown
$input.on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
        doneTyping();
    }, doneTypingInterval);
});
//on keydown, clear the countdown
$input.on('keydown', function () {
    clearTimeout(typingTimer);
});
function doneTyping () {
    if ($('#user-input')[0].value.length !== 0){
        endOfResults = 0;
        runSearch();
    }
}
$('button.clear').on('click', function(){
    $($input).val("").focus();
    $('#results-container').empty();
    endOfResults = 0;
});
function runSearch () {
    if(endOfResults === 0){
        offsetValue = 0;
        $($resultsContainer).empty();
        searchNyc(offsetValue);
        $($resultsContainer).css('display', 'block');
        scrollLoad('#results-container');
        appResize();
        setTimeout(function(){
            inputBlur();
        }, 500);
    }
}
function inputBlur(){
    $input.blur();
}
function appResize (){
    var totalHeight = $('.tool-container').innerHeight();
    var headerHeight = $('header').outerHeight();
    var inputHeight = $('#input-area').outerHeight();
    var footerHeight = $('footer').outerHeight();
    var resultsHeight = totalHeight - inputHeight - headerHeight - footerHeight;
    $('#results-container').css('max-height', Math.floor(resultsHeight));
}
$(window).on('resize', function(){
    appResize();
});
function scrollLoad(elem){
    if(endOfResults === 0){
        var resultHeight = 0;
        $(elem).bind('scroll', function() {
            resultHeight = $(elem).innerHeight() + 3;
            if ($(elem).scrollTop() + resultHeight >= $(elem)[0].scrollHeight && $('#user-input')[0].value.length !== 0) {
                offsetValue = offsetValue + 5;
                searchNyc(offsetValue);
            }
        });
    }
}
function loadingAnimationToggle(){
    $('#loading').addClass("active");
    setTimeout(function(){
        $('#loading').removeClass("active")},
        500);
}


var baseUrl = "https://data.cityofnewyork.us/resource/";
var endpoint = "43nn-pn8j.json?";
var appToken = "CkMdPHTRlkUB2u1ixJnSUW3Ve";
function searchNyc(offset){
    if(endOfResults === 0) {
        loadingAnimationToggle();
        var userInput = $("input").val().toUpperCase();
        $.ajax({
            url: baseUrl + endpoint,
            type: "GET",
            dataType: "json",
            data: {
                "$limit": 5,
                "$offset": offset,
                "$$app_token": appToken,
                "$where": 'upper(dba) like"%' + userInput + '%"',
                "$order": "camis ASC",
                "$select": "camis,MAX(inspection_date)",
                "$group": "camis"
            }
            // , success: function( data, status, jqxhr ){
            //     console.log( "Request received:", data );
            // },
            // error: function( jqxhr, status, error ){
            //     console.log( "Something went wrong!" );
            // }
        }).done(function (data) {
            var arraySize = data.length;
            if (((arraySize === 0) || (userInput.includes(";")) || (userInput === "")) && offsetValue === 0 && $resultsContainer[0].children.length === 0) {
                var returnedInfo = $('<div class="info-display">');
                $($resultsContainer).append(returnedInfo);
                $($resultsContainer).children('div:last-child').append('<p class="error-message">OUR ROBOTS CANNOT FIND THAT RESTAURANT.</p><p class="error-message">PLEASE DOUBLE-CHECK THE NAME.</p>');
            } else if ((offsetValue !== 0) && (arraySize === 0)) {
                offsetValue = 0;
                endOfResults = 1;
            } else if (arraySize !== 0) {
                refineDohResults(data)
            }
        });
    }
}

function refineDohResults(data) {
    $(data).each(function() {
        $.ajax({
            url: baseUrl + endpoint,
            type: "GET",
            dataType: "json",
            data: {
                "camis": this.camis,
                "inspection_date": this.MAX_inspection_date,
                "$order": "camis ASC",
                "$select": "camis,grade,dba,building,street,boro,zipcode,violation_description,critical_flag"
            }
        }).done(function(data) {
            buildResults(data);
        });
    });
}

function buildResults(result){
    if (result[0].grade === undefined || result[0].grade === "Not Yet Graded") {
        var certificateCard = "Z";
        var certificateTitle = "NYC Sanitation Grade Pending";
    } else {
        certificateCard = result[0].grade;
        certificateTitle = "NYC Sanitation Grade " + certificateCard;
    }
    var name = '<h2>' + result[0].dba.replaceAll("/", " / ").replaceAll("Â¢", "¢") + '</h2>';
    var grade = '<div class="certificate-display"><div class="certificate '+ certificateCard +'" " title="' + certificateTitle + '"></div></div>';
    var address = '<p class="address-display">' + result[0].building + ' ' + result[0].street + ', ' + result[0].boro + " " + result[0].zipcode + '</p>';
    $($resultsContainer).append('<div id="'+result[0].camis+ '" class="info-display"></div>');
    $($resultsContainer).children('div:last-child').append('<div class="details-container"></div>');
    $($resultsContainer).children('div:last-child').children('.details-container').append([name, grade, address]).append('<ul>');
    $(result).each(function(){
        if (this.violation_description !== undefined){
            violationClean = this.violation_description.replaceAll(" Âº", "Âº").replaceAll("Âº ", "Âº").replaceAll("Âº", "°").replaceAll("", "'").replaceAll("''''", "'")
        } else {violationClean = "No violation description listed"}
        if (this.critical_flag == "Critical"){
            var violation = '<li class="critical">' + violationClean + '</li>';
        } else{
            var violation = "<li>" + violationClean + "</li>";
        }
        $($resultsContainer).children('div:last-child').children('.details-container').children('ul').append(violation);
    });
}

// function queryNycDoh(offset){
//     if(endOfResults === 0){
//       loadingAnimationToggle();
//       var userInput = $("input").val().toUpperCase();
//       var baseURL = "https://data.cityofnewyork.us/resource/";
//       var endpoint = "43nn-pn8j.json?";
//       var testQueryString = '$where=upper(dba) like "%25' + userInput + '%25"&$order=camis ASC &$select=camis,MAX(inspection_date)&$group=camis&$limit=5&$offset=' + offset + '&$$app_token=CkMdPHTRlkUB2u1ixJnSUW3Ve';
//       $.getJSON(baseURL + endpoint + testQueryString, function(data) {
//           var arraySize = data.length;
//           if (((arraySize === 0) || (userInput.includes(";")) || (userInput === "")) && offsetValue === 0) {
//               var returnedInfo = $('<div class="info-display">');
//               $('#results-container').append(returnedInfo);
//               $('#results-container > div:last-child').append('<p class="error-message">OUR ROBOTS CANNOT FIND THAT RESTAURANT.</p><p class="error-message">PLEASE DOUBLE-CHECK THE NAME.</p>');
//           } else if ((offsetValue !== 0) && (arraySize === 0)){
//               offsetValue = 0;
//               endOfResults = 1;
//           } else if (arraySize !== 0){
//               $(data).each(function(){
//                   var refinedQueryString = "&camis='" + this.camis + "'&inspection_date='" + this.MAX_inspection_date + "'&$order=camis ASC&$select=grade,dba,building,street,boro,zipcode,violation_description";
//                   $.getJSON(baseURL + endpoint + refinedQueryString, function(result){
//                       console.log(result);
//
//                       if (result[0].grade === undefined || result[0].grade === "Not Yet Graded") {
//                           var certificateCard = "Z";
//                           var certificateTitle = "NYC Sanitation Grade Pending";
//                       } else {
//                           certificateCard = result[0].grade;
//                           certificateTitle = "NYC Sanitation Grade " + certificateCard;
//                       }
//                       var name = '<h2>' + result[0].dba.replaceAll("/", " / ").replaceAll("Â¢", "¢") + '</h2>';
//                       var grade = '<div class="certificate-display"><div class="certificate '+ certificateCard +'" " title="' + certificateTitle + '"></div></div>';
//                       var address = '<p class="address-display">' + result[0].building + ' ' + result[0].street + ', ' + result[0].boro + " " + result[0].zipcode + '</p>';
//                       $($resultsContainer).append('<div id="'+result[0].camis+ '" class="info-display"></div>');
//                       $($resultsContainer).children('div:last-child').append('<div class="details-container"></div>');
//                       $($resultsContainer).children('div:last-child').children('.details-container').append([name, grade, address]).append('<ul>');
//                       $(result).each(function(){
//                           if (this.violation_description !== undefined){
//                               violationClean = this.violation_description.replaceAll(" Âº", "Âº").replaceAll("Âº ", "Âº").replaceAll("Âº", "°").replaceAll("", "'").replaceAll("''''", "'")
//                           } else {violationClean = "No violation description listed"}
//                           var violation = "<li>" + violationClean + "</li>";
//                           $($resultsContainer).children('div:last-child').children('.details-container').children('ul').append(violation);
//                       });
//                   });
//               });
//           }
//       });
//     }
// }
$( document ).ready(function() {
    $( "#user-input" ).focus();
});