$(document).ready(function() {
  $(".nav").on("click", function() {
    scrollTo($(this).html().toLowerCase());
  });

  $(".button").on("click", function() {
    contentControl($(this));
  });
});

function scrollTo(selector) {
  var offset = -80;
  $('html, body').animate({
        scrollTop: $("#"+selector).offset().top + offset
    }, 1000);
}

function contentControl(object) {
  var words = object.html().split(" ");
  var selector;

  if (words[1] === "Stories") {
    selector = "story"; 
  } else {
    selector = "section"
  }
  
  if (words[0] === "Show") {
    $("."+selector).show(400, function() {});
    object.html("Hide " + words[1]);
  } else {
    $("."+selector).hide(400, function() {});
    object.html("Show " + words[1]);
  }
}