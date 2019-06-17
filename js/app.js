String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};
var offsetValue = 0;
//user is "finished typing," do something
var typingTimer;                //timer identifier
var doneTypingInterval = 1250;  //time in ms, 5 second for example
var $input = $('#user-input');
//on keyup, start the countdown
$input.on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
});
//on keydown, clear the countdown
$input.on('keydown', function () {
    clearTimeout(typingTimer);
});
function doneTyping () {
    if ($('#user-input')[0].value.length !== 0){
        offsetValue = 0;
        runSearch();
    }
}
$('button.clear').on('click', function(){
    $($input).val("").focus();
});
function runSearch () {
    offsetValue = 0;
    $('#results-container').empty();
    queryNycDoh(offsetValue);
    $('#results-container, #more-btn').css('display', 'block');
    scrollLoad('#results-container');
    appResize();
    setTimeout(function(){
        inputBlur();
        loadingAnimationToggle();
    }, 500);
}
function inputBlur(){
    $input.blur();
}
function appResize (){
    var totalHeight = $('.tool-container').innerHeight();
    var inputHeight = $('#input-area').outerHeight();
    var headerHeight = $('header').outerHeight();
    var footerHeight = $('footer').outerHeight();
    var resultsHeight = totalHeight - inputHeight - headerHeight - footerHeight - 47;
    $('#results-container').css('max-height', Math.floor(resultsHeight));
}
$(window).on('resize', function(){
    appResize();
});
function scrollLoad(elem){
    var resultHeight = 0;
    $(elem).bind('scroll', function() {
        resultHeight = $(elem).innerHeight() + 15;
        if ($(elem).scrollTop() + resultHeight >= $(elem)[0].scrollHeight && $('#user-input')[0].value.length !== 0) {
            offsetValue = offsetValue + 5;
            queryNycDoh(offsetValue);
            setTimeout(loadingAnimationToggle, 500);
        }
    });
}
function loadingAnimationToggle(){
    $('#loading').toggleClass("active");
}
function queryNycDoh(offset){
  loadingAnimationToggle();
  var userInput = $("input").val().toUpperCase();
  var baseURL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
  var testQueryString = "?$where=upper(dba) like '%25" + userInput + "%25'&$order=camis ASC &$select=camis,MAX(inspection_date)&$group=camis&$limit=5&$offset=" + offset;
  $.getJSON(baseURL + testQueryString, function(data) {
      var arraySize = data.length;
      if (((arraySize == 0) || (userInput.includes(";")) || (userInput === "")) && offsetValue == 0) {
          var returnedInfo = $('<div class="info-display">');
          $('#results-container').append(returnedInfo);
          $('#results-container > div:last-child').append('<p class="error-message">OUR ROBOTS CANNOT FIND THAT RESTAURANT.</p><p class="error-message">PLEASE DOUBLE-CHECK THE NAME.</p>');
      } else if ((offsetValue !== 0) && (arraySize == 0)){
          console.log("nothing here");
          offsetValue == 0;
      } else if (arraySize !== 0){
          $(data).each(function(){
              var refinedQueryString = "?&camis='" + this.camis + "'&inspection_date='" + this.MAX_inspection_date + "'&$order=camis ASC";
              $.getJSON(baseURL + refinedQueryString, function(result){

                  if (result[0].grade == undefined || result[0].grade == "Not Yet Graded") {
                      var certificateCard = "Z";
                      var certificateTitle = "NYC Sanitation Grade Pending";
                  } else {
                      certificateCard = result[0].grade;
                      certificateTitle = "NYC Sanitation Grade " + certificateCard;
                  }
                  var name = '<h2>' + result[0].dba.replaceAll("/", " / ").replaceAll("Â¢", "¢") + '</h2>';
                  var grade = '<div class="certificate-display"><div class="certificate '+ certificateCard +'" " title="' + certificateTitle + '"></div></div>';
                  var address = '<p class="address-display">' + result[0].building + ' ' + result[0].street + ', ' + result[0].boro + '</p>';
                  $('#results-container').append('<div id="'+result[0].camis+ '" class="info-display"></div>');
                  $('#results-container > div:last-child').append('<div class="details-container"></div>');
                  $('#results-container > div:last-child > .details-container').append([name, grade, address]).append('<ul>');
                  $(result).each(function(){
                      if (this.violation_description !== undefined){
                          violationClean = this.violation_description.replaceAll(" Âº", "Âº").replaceAll("Âº ", "Âº").replaceAll("Âº", "°").replaceAll("", "'").replaceAll("''''", "'")
                      } else {violationClean = "No violation description listed"}
                      var violation = "<li>" + violationClean + "</li>";
                      $('#results-container > div:last-child > .details-container > ul').append(violation);
                  });
              });
          });
      }
  });
}
$( document ).ready(function() {
    $( "#user-input" ).focus();
});