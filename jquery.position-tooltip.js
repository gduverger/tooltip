/*!
 * PositionTooltip
 * by Georges Duverger
 * http://gduverger.com/
 */

//    left-top --- top-center ---- top-right
//           |                     |
// left-middle       target        right-middle (*)
//           |                     |
// bottom-left -- bottom-center -- right-bottom

(function($){
	
	var positions = {
		"right-middle": function(target, tooltip) {
			return { "top": target.top+(target.height/2)-(tooltip.height/2), "left": target.left+target.width };
		},
		"right-bottom": function(target, tooltip) {
			return { "top": target.top+target.height, "left": target.left+target.width };
		},
		"bottom-center": function(target, tooltip) {
			return { "top": target.top+target.height, "left": target.left+(target.width/2)-(tooltip.width/2) };
		},
		"bottom-left": function(target, tooltip) {
			return { "top": target.top+target.height, "left": target.left-tooltip.width };
		},
		"left-middle": function(target, tooltip) {
			return { "top": target.top+(target.height/2)-(tooltip.height/2), "left": target.left-tooltip.width };
		},
		"left-top": function(target, tooltip) {
			return { "top": target.top-tooltip.height, "left": target.left-tooltip.width };
		},
		"top-center": function(target, tooltip) {
			return { "top": target.top-tooltip.height, "left": target.left+(target.width/2)-(tooltip.width/2) };
		},
		"top-right": function(target, tooltip) {
			return { "top": target.top-tooltip.height, "left": target.left+target.width };
		}
	}

	$.fn.extend({
		positionTooltip: function(options) {
			var settings;
			
			settings = $.extend( {}, {
					$tooltip: $("#tooltip"),
					borderPadding: 0,
					dataPosition: "position",
					order: ["right-middle", "right-bottom", "bottom-center", "bottom-left", "left-middle", "left-top", "top-center", "top-right"],
					mouseover: function() {}
				}, options );

			this.each(function() {
				var $target, tooltipDimension, targetOffset, targetDimension, tooltipOffset;

				$target = $(this);
				$target.on("mouseover", function() {

					settings.mouseover($target, settings.$tooltip);
					tooltipDimension = {
						"width": settings.$tooltip.outerWidth(true),
						"height": settings.$tooltip.outerHeight(true)
					};

					targetOffset = $target.offset();
					targetDimension = {
						"top": targetOffset.top,
						"left": targetOffset.left,
						"width": $target.outerWidth(true) || parseInt($target.attr("r"))*2,
						"height": $target.outerHeight(true) || parseInt($target.attr("r")*2)
					}
			
					tooltipOffset = positions[ $target.data(settings.dataPosition) || settings.order[0] ](targetDimension, tooltipDimension);

					var i = 0;
					while(!fitOnPage(tooltipOffset, tooltipDimension, settings.borderPadding) && i < settings.order.length) {
						tooltipOffset = positions[settings.order[i++]](targetDimension, tooltipDimension);
					}
					// TODO fallback if none of the positions fit

					settings.$tooltip.css(tooltipOffset).show();
			
				}).on("mouseout", function() {
					settings.$tooltip.hide();
				});				
			});
			
			return this;
		},
		
		appendRandomClonesTo: function(targetSelector, appendToSelector) {
			for (var j=0; j<100; j++) {
				$(targetSelector).eq(0).clone(false).attr({
					"cy": Math.floor(Math.random()*pageDimension.height),
					"cx": Math.floor(Math.random()*pageDimension.width)
				}).appendTo(appendToSelector);
			}
			return this;
		}
	});

	var fitOnPage = function(tooltipOffset, tooltipDimension, borderPadding) {
		return tooltipOffset.top > borderPadding
			&& tooltipOffset.top+tooltipDimension.height < pageDimension.height-borderPadding
			&& tooltipOffset.left > borderPadding
			&& tooltipOffset.left+tooltipDimension.width < pageDimension.width-borderPadding;
	};
	
	var setPageDimension = function() {
		var $page = $(window);
		pageDimension = {
			"height": $page.height(),
			"width": $page.width()
		};
	};

	var pageDimension;

	$(window).resize(setPageDimension);
	setPageDimension();

})(jQuery);