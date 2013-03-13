(function( $ ){

    //    left-top --- top-center ---- top-right
    //           |                     |
    // left-middle       target        right-middle [0]
    //           |                     |
    // bottom-left -- bottom-center -- right-bottom

    var positions = {
        "right-middle": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + ( targetDimension.height / 2 ) - ( tooltipDimension.height / 2 ), left: targetDimension.left + targetDimension.width };
        },
        "right-bottom": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + ( targetDimension.height / 2 ), left: targetDimension.left + targetDimension.width };
        },
        "bottom-center": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + targetDimension.height, left: targetDimension.left + ( targetDimension.width / 2 ) - ( tooltipDimension.width / 2 ) };
        },
        "bottom-left": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + ( targetDimension.height / 2 ), left: targetDimension.left - tooltipDimension.width };
        },
        "left-middle": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + ( targetDimension.height / 2 ) - ( tooltipDimension.height / 2 ), left: targetDimension.left - tooltipDimension.width };
        },
        "left-top": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + ( targetDimension.height / 2 ) - tooltipDimension.height, left: targetDimension.left - tooltipDimension.width };
        },
        "top-center": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top - tooltipDimension.height, left: targetDimension.left + ( targetDimension.width / 2 ) - ( tooltipDimension.width / 2 ) };
        },
        "top-right": function( targetDimension, tooltipDimension ) {
            return { top: targetDimension.top + ( targetDimension.height / 2 ) - tooltipDimension.height, left: targetDimension.left + targetDimension.width };
        }
    }

    $.fn.extend({
        tooltip: function( options ) {

            var settings = $.extend( {}, {
                showOn: "mouseover",
                hideOn: "mouseout",
                $tooltip: $("#tooltip"),
                extraMargins: { top: 0, right: 0, bottom: 0, left: 0 },
                preferredPositions: [ "right-middle", "right-bottom", "bottom-center", "bottom-left", "left-middle", "left-top", "top-center", "top-right" ],
                beforeShowCallback: function( event, $target, $tooltip ) { return true; },
                afterShowCallback: function( event, $target, $tooltip ) {},
                beforeHideCallback: function( event, $target, $tooltip ) { return true; },
                afterHideCallback: function( event, $target, $tooltip ) {},
            }, options );

            this.each(function() {
                var $target, tooltipDimension, targetOffset, targetDimension, tooltipClass, tooltipOffset;

                $target = $( this );
                $target.on( settings.showOn, function( event ) {

                    if ( !settings.beforeShowCallback( event, $target, settings.$tooltip ) ) return null;

                    settings.$tooltip.removeClass( settings.preferredPositions.join(" ") ).removeAttr( "style" );

                    tooltipDimension = {
                        width: settings.$tooltip.outerWidth( true ),
                        height: settings.$tooltip.outerHeight( true )
                    };

                    targetOffset = $target.offset();
                    targetDimension = {
                        top: targetOffset.top,
                        left: targetOffset.left,
                        width: $target.outerWidth( true ) || parseInt( $target.attr("r") ) * 2,
                        height: $target.outerHeight( true ) || parseInt( $target.attr("r") ) * 2
                    }

                    tooltipClass = settings.preferredPositions[0];
                    tooltipOffset = positions[ tooltipClass ]( targetDimension, tooltipDimension );

                    var i = 0;
                    while ( !fitOnPage( tooltipOffset, tooltipDimension, settings.extraMargins ) && i < settings.preferredPositions.length ) {
                        tooltipClass = settings.preferredPositions[ i++ ];
                        tooltipOffset = positions[ tooltipClass ]( targetDimension, tooltipDimension );
                    }
                    // TODO fallback if none of the positions fit

                    settings.$tooltip.css( tooltipOffset ).addClass( tooltipClass ).show();

                    settings.afterShowCallback( event, $target, settings.$tooltip );

                }).on( settings.hideOn, function( event ) {

                    if ( !settings.beforeHideCallback( event, $target, settings.$tooltip ) ) return null;
                    settings.$tooltip.hide();
                    settings.afterHideCallback( event, $target, settings.$tooltip );

                });
            });

            return this;
        }
    });

    var fitOnPage = function( tooltipOffset, tooltipDimension, extraMargins ) {
        return tooltipOffset.top - extraMargins.top > 0
            && tooltipOffset.top + tooltipDimension.height + extraMargins.bottom < pageDimension.height
            && tooltipOffset.left - extraMargins.left > 0
            && tooltipOffset.left + tooltipDimension.width + extraMargins.right < pageDimension.width;
    };
	
    var pageDimension,
        setPageDimension = function() {
        var $page = $( window );
        pageDimension = {
            height: $page.height(),
            width: $page.width()
        };
    };

    $( window ).resize( setPageDimension );
    setPageDimension();

})( jQuery );
