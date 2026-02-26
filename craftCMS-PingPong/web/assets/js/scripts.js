$(document).ready(function() {

    $("#owl-events").owlCarousel({
      items: 1,  
      margin: 10, 
      loop: true, 
      nav: false, 
      dots: true, 
      responsive: {
        0: {
          items: 1, 
        },
        425: {
          items: 1.5, 
        },
        768: {
          items: 2.5, 
        },
        1024: {
          items: 3.5, 
        },
        1200: {
          items: 4.5, 
        }
      }
    });
  
    $("#owl-drinks").owlCarousel({
      items: 1,  
      margin: 10, 
      loop: true, 
      nav: false, 
      dots: true, 
      responsive: {
        0: {
          items: 1, 
        },
        425: {
          items: 1.5, 
        },
        768: {
          items: 2.5, 
        },
        1024: {
          items: 3.5, 
        },
        1200: {
          items: 4.5, 
        }
      }
    });
  });