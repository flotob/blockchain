(function ($) {

    $.fn.parallaxBlur = function () {
      var window_width = $(window).width();
      // Parallax Scripts
      return this.each(function(i) {
        var $this = $(this);
        $this.addClass('parallax');

        var updateParallax = (function () {
          var zero;

          var fn = function (initial) {

            var container_height;
            if (window_width < 601) {
              container_height = ($this.height() > 0) ? $this.height() : $this.children("img").height();
            }
            else {
              container_height = ($this.height() > 0) ? $this.height() : 500;
            }
            var $img = $this.children("img").first();
            var img_height = $img.height();
            var parallax_dist = img_height - container_height;
            var bottom = $this.offset().top + container_height;
            var top = $this.offset().top;
            var scrollTop = $(window).scrollTop();
            var windowHeight = window.innerHeight;
            var windowBottom = scrollTop + windowHeight;
            var percentScrolled = (windowBottom - top) / (container_height + windowHeight);
            var parallax = Math.round((parallax_dist * percentScrolled));

            if (initial) {
              zero = percentScrolled;
              console.log(zero);
              $img.css('display', 'block');
              var path = $img.attr('src').split('.'),
                  url = path.shift() + '_blur.' + path.shift(),
                  $imgBlur = $('<img src="' + url + '">')
                              .css('opacity', 0);

              $img.after($imgBlur); // insert imgBlur into dom

              // $img.css('transform', "translate3D(-50%," + parallax + "px, 0)");
              // $imgBlur.css('transform', "translate3D(-50%," + parallax + "px, 0)");
            }

            $this.children("img").last()
              .css({
                display: 'block',
                opacity: percentScrolled * ($(document).scrollTop()/150)
              });
          }

          return _.throttle(fn, 100);
        })();

        var updateParallaxCss = function () {
          var container_height;
          if (window_width < 601) {
            container_height = ($this.height() > 0) ? $this.height() : $this.children("img").height();
          }
          else {
            container_height = ($this.height() > 0) ? $this.height() : 500;
          }
          var $img = $this.children("img").first();
          var img_height = $img.height();
          var parallax_dist = img_height - container_height;
          var bottom = $this.offset().top + container_height;
          var top = $this.offset().top;
          var scrollTop = $(window).scrollTop();
          var windowHeight = window.innerHeight;
          var windowBottom = scrollTop + windowHeight;
          var percentScrolled = (windowBottom - top) / (container_height + windowHeight);
          var parallax = Math.round((parallax_dist * percentScrolled));

          if (initial) {
            zero = percentScrolled;
            $img.css('display', 'block');
            // var path = $img.attr('src').split('.'),
            //     url = path.shift() + '_blur.' + path.shift(),
            //     $imgBlur = $('<img src="' + url + '">')
            //                 .css('opacity', 0);

            // $img.after($imgBlur); // insert imgBlur into dom

            // $img.css('transform', "translate3D(-50%," + parallax + "px, 0)");
            // $imgBlur.css('transform', "translate3D(-50%," + parallax + "px, 0)");
          }

          var filterVal = 'blur(' + ( $(document).scrollTop() / 10 ) + 'px)';

          console.log('filter',filterVal);

          $this.children("img").last()
            .css('filter',filterVal)
            .css('webkitFilter',filterVal)
            .css('mozFilter',filterVal)
            .css('oFilter',filterVal)
            .css('msFilter',filterVal);
        };

        // Wait for image load
        $this.children("img").one("load", function() {
          updateParallax(true);
        }).each(function() {
          if(this.complete) $(this).load();
        });

        $(window).scroll(function() {
          window_width = $(window).width();
          updateParallax(false);
        });

        $(window).resize(function() {
          window_width = $(window).width();
          updateParallax(false);
        });

      });

    };
}( jQuery ));