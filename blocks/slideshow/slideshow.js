

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = $('.slideshow > div');
  //let captionText = document.getElementById("caption");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  $('.thumbnailImg img').removeClass('active');
  $('.thumbnailImg').eq(slideIndex-1).find('img').addClass('active');
  slides[slideIndex-1].style.display = "block";
  //captionText.innerHTML = dots[slideIndex-1].alt;
}
$(document).ready( function() {
  setTimeout( function() {
    let thumbnailContent = "";
    $('.slideshow > div').each( function(index) {
        let imageSrc = $(this).find('picture img').attr('src');
        thumbnailContent += '<div class="thumbnailImg"><img alt="image" src="' + imageSrc +'" /></div>';
    });
    let thumbnailWrapper = '<div class="thumbnailWrapper">' + thumbnailContent + '</div>';
    $('.slideshow-wrapper').append(thumbnailWrapper);
    $('.slideshow-wrapper').append('<a class="slideArrow arrowPrev">❮</a> <a class="slideArrow arrowNext">❯</a>');
  }, 1000);
  $('body').on('click', '.thumbnailImg img', function() {
    let imgIndex = $(this).parent('.thumbnailImg').index();
    currentSlide(imgIndex + 1)
    console.log(imgIndex);
  });
  $('body').on('click', '.arrowPrev', function() {
    plusSlides(-1);
  });
  $('body').on('click', '.arrowNext', function() {
    plusSlides(1);
  });
});

 