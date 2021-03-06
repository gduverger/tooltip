( function( $ ) {

    $.fn.extend({
        tooltip: function( options ) {

            var settings = $.extend( {}, {

                    /* ----------------------------- Available options ---------------------------- */

                    $box: null,                 // A jQuery element in which the tooltip will be displayed
                    selector: null,             // The target element that will trigger the tooltip
                    hideTimeout: 100,           // A timeout before the tooltip will be hidden
                    showTimeout: 100,           // A timeout before the tooltip will be shown
                    hideOn: "mouseout",         // The event to hide the tooltip on
                    showOn: "mouseover",        // The event to show the tooltip on
                    canHoverTooltip: true,      // If you want to be able to mouseover the tooltip
                    $tooltip: $( "#tooltip" ),  // The tooltip itself
                    extraMargins: {             // To display the toolip further away from the target
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
                    preferredPositions: [       // The order in which the tooltip will try to render itself
                        "right-middle",
                        "right-bottom",
                        "bottom-center",
                        "bottom-left",
                        "left-middle",
                        "left-top",
                        "top-center",
                        "top-right"
                    ],
                    beforeShowCallback: function( event, $target, $tooltip ) { return true; },
                    afterShowCallback: function( event, $target, $tooltip ) {},
                    beforeHideCallback: function( event, $target, $tooltip ) { return true; },
                    afterHideCallback: function( event, $target, $tooltip ) {},
                }, options ),

                /* -------------------------------------------------------------------------------- */

                boxOffset = settings.$box ? settings.$box.offset() || { top: 0, left: 0 } : null,
                boxDimension = settings.$box ? {
                    height: settings.$box.height(),
                    width: settings.$box.width()
                } : null;

            this.each(function() {
                var $target, forcedPosition, tooltipDimension, targetOffset, targetDimension, tooltipClass, tooltipOffset, isShown;

                $( this ).on( settings.showOn, settings.selector, function( event ) {
                    $target = $( this );

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
                        width: $target.outerWidth() || parseInt( $target.attr("r") ) * 2 || 0,
                        height: $target.outerHeight() || parseInt( $target.attr("r") ) * 2 || 0
                    };

                    forcedPosition = $target.data( "tooltip-position" );
                    tooltipClass = forcedPosition ? forcedPosition : settings.preferredPositions[ 0 ];
                    tooltipOffset = positions[ tooltipClass ]( targetDimension, tooltipDimension );

                    var i = 0;
                    while ( !forcedPosition && !canShowInsideWindowAndBox( tooltipOffset, tooltipDimension, settings.extraMargins, boxOffset, boxDimension ) && i < settings.preferredPositions.length ) {
                        tooltipClass = settings.preferredPositions[ i++ ];
                        tooltipOffset = positions[ tooltipClass ]( targetDimension, tooltipDimension );
                    }

                    isShown = true;
                    setTimeout( function() {
                        if ( isShown ) {
                            settings.$tooltip.css( tooltipOffset ).addClass( tooltipClass ).show();
                            settings.afterShowCallback( event, $target, settings.$tooltip );
                        }
                    }, settings.showTimeout );

                }).on( settings.hideOn, settings.selector, function( event ) {
                    $target = $( this );

                    if ( !settings.beforeHideCallback( event, $target, settings.$tooltip ) ) return null;
                    isShown = false;
                    setTimeout( function() {
                        if ( !isShown ) {
                            settings.$tooltip.hide();
                            settings.afterHideCallback( event, $target, settings.$tooltip );
                        }
                    }, settings.hideTimeout );

                });

                if ( settings.canHoverTooltip ) {
                    settings.$tooltip.on( "mouseenter", function( event ) {
                        isShown = true;
                    }).on( "mouseleave", function( event ) {
                        isShown = false;
                        settings.$tooltip.hide();
                        settings.afterHideCallback( event, $target, settings.$tooltip );
                    });
                }

            });

            return this;
        }
    });

    function canShowInsideWindowAndBox( tooltipOffset, tooltipDimension, extraMargins, boxOffset, boxDimension ) {
        var $window = $( window ),
            windowOffset = { top: $window.scrollTop(), left: $window.scrollLeft() },
            windowDimension = { height: $window.height(), width: $window.width() };

        return tooltipOffset.top > windowOffset.top + extraMargins.top
            && tooltipOffset.left > windowOffset.left + extraMargins.left
            && tooltipOffset.top + tooltipDimension.height < windowOffset.top + windowDimension.height - extraMargins.bottom
            && tooltipOffset.left + tooltipDimension.width < windowOffset.left + windowDimension.width - extraMargins.right
            && ( !boxOffset || tooltipOffset.top > boxOffset.top + extraMargins.top )
            && ( !boxOffset || tooltipOffset.left > boxOffset.left + extraMargins.right )
            && ( !boxOffset || !boxDimension || tooltipOffset.top + tooltipDimension.height < boxOffset.top + boxDimension.height - extraMargins.bottom )
            && ( !boxOffset || !boxDimension || tooltipOffset.left + tooltipDimension.width < boxOffset.left + boxDimension.width - extraMargins.right );
    }

    /* ----------------------------------- Positions ----------------------------------

        left-top [5] --- top-center [6] ---- top-right [7]
                   |                         |
     left-middle [4]         target          right-middle [0]
                   |                         |
     bottom-left [3] -- bottom-center [2] -- right-bottom [1]

    -------------------------------------------------------------------------------- */

    var positions = {
        "right-middle": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + ( targetDimension.height / 2 ) - ( tooltipDimension.height / 2 ),
                left: targetDimension.left + targetDimension.width
            };
        },
        "right-bottom": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + ( targetDimension.height / 2 ),
                left: targetDimension.left + targetDimension.width
            };
        },
        "bottom-center": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + targetDimension.height,
                left: targetDimension.left + ( targetDimension.width / 2 ) - ( tooltipDimension.width / 2 )
            };
        },
        "bottom-left": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + ( targetDimension.height / 2 ),
                left: targetDimension.left - tooltipDimension.width
            };
        },
        "left-middle": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + ( targetDimension.height / 2 ) - ( tooltipDimension.height / 2 ),
                left: targetDimension.left - tooltipDimension.width
            };
        },
        "left-top": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + ( targetDimension.height / 2 ) - tooltipDimension.height,
                left: targetDimension.left - tooltipDimension.width
            };
        },
        "top-center": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top - tooltipDimension.height,
                left: targetDimension.left + ( targetDimension.width / 2 ) - ( tooltipDimension.width / 2 )
            };
        },
        "top-right": function( targetDimension, tooltipDimension ) {
            return {
                top: targetDimension.top + ( targetDimension.height / 2 ) - tooltipDimension.height,
                left: targetDimension.left + targetDimension.width
            };
        }
    };

})( jQuery );
