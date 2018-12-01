/**
 * Jumbo Menu
 *
 * @author Jeremie Jarosh
 * @description
 *   A simple "Mega" menu that displays <ul> based navigations as columned flyouts
 *
 *   Expected Structure
 *    <div|nav>  -- apply jumboMenu to this
 *      <ul>
 *        <li>
 *          <a|span>
 *          <ul>
 *            <li>
 *              <a>
 *              <ul>
 *                etc.
 *
 *   Initialise
 *    $('.horizontal_nav').jumboMenu({columns:4});
 *
 *   Prevent Initial Flyout Flash
 *    .horizontal_nav > ul > li > ul { visibility: hidden; }
 *
 *   Notes:
 *    - The CSS for the column widths must be set manually
 *
 */
(function( $, window, undefined ) {

	"use strict";

	$.fn.jumboMenu = function( options ) {

		var opts = $.extend( {}, $.fn.jumboMenu.defaults, options ),
			timeout = opts.timeout,
			closeTimer = 0,
			$menuItem = 0,
			menuOpen = function($elm) {  // open hidden layer
				// cancel close timer
				menuCancelCloseTime();

				// close old layer
				menuClose();

				// get new layer and show it
				$menuItem = $elm;
				$menuItem.css( "visibility", "visible" );
			},
			menuClose = function() {  // close showed layer
				if($menuItem) { $menuItem.css( "visibility", "hidden" ); }
			},
			menuCloseTime = function() {  // start close timer
				closeTimer = window.setTimeout(menuClose, timeout);
			},
			menuCancelCloseTime = function() {  // cancel close timer
				if(closeTimer) {
					window.clearTimeout(closeTimer);
					closeTimer = null;
				}
			},
			$wrapper = this,
			$mainHeaders = $wrapper.find('> ul > li');

		// add sub-menu wrapper
		$mainHeaders.find('> ul').wrap( $('<div/>',{"class":"sub-menu","style":"visibility:hidden; position:absolute"}) );

		// open / close sub-menus
		$mainHeaders.on("mouseover", function(){ menuOpen($(this).find('> .sub-menu')); });
		$mainHeaders.on("mouseout", menuCloseTime);

		// break menus into columns
		$mainHeaders.find('> .sub-menu').each(function(idx,elm){
			var i, $firstCol, $firstColElms, heightPerCol, currCol, currHeight, colHeights, columns,
				biggestElmHeight = 0,
				totalHeight = 0,
				slop = 1.0,
				$parent = $(elm).parent();
			if(!$parent.hasClass('products')) {
				var sub = $(elm).find('> ul');
				sub.unwrap();
				$parent.addClass('no-mega');
				return true;
			}
			// determine number of columns based on data-columns attribute with a default fallback
			columns = ( $parent.data('columns') ) ? $parent.data('columns') : opts.columns;

			// add column count class to parent element
			$parent.addClass('columns-'+columns);

			// add class
			$(elm).find('> ul').addClass('column').addClass('col-1').css("display","inline-block").css("vertical-align","top");
			$firstCol = $(elm).find('> ul.col-1');
			$firstColElms = $firstCol.find('> li');

			// add columns
			for ( i = 2; i <= columns; i++ ) {
				$(elm).find('> ul.col-1').clone().html('').removeClass('col-1').addClass('col-'+i).appendTo( elm );
			}

			// get total height and biggest element height
			$firstColElms.each(function(liIdx,liElm){
				var currentElmHeight = $(liElm).height();
				totalHeight += currentElmHeight;
				biggestElmHeight = Math.max( biggestElmHeight, currentElmHeight );
			});

			// divide into columns ( make sure the last column is not the smallest )
			do {
				currCol = 1;
				currHeight = 0;
				colHeights = [];

				// determine column height, but don't allow it to be less than the biggest element
				heightPerCol = Math.max( Math.ceil(totalHeight / columns * slop), biggestElmHeight );

				//console.log("do..while", slop, heightPerCol);

				$firstColElms.each(function(itemIdx,itemElm){
					if ( currCol != columns && currHeight + $(itemElm).height() > heightPerCol ) {
						colHeights[currCol] = currHeight;
						currCol++;
						currHeight = 0;
					}

					if ( colHeights[currCol] === undefined ) {
						colHeights[currCol] = 0;
					}
					currHeight += $(itemElm).height();

					$(itemElm).removeClass (function(index, css) {
						return (css.match(/\bcol-\S+/g) || []).join(' ');
					});

					$(itemElm).addClass('col-'+currCol);
				});
				colHeights[currCol] = currHeight;

				slop += 0.1;

			} while ( Math.max.apply( Math, colHeights.slice(1,columns+1) ) == colHeights[columns] && slop < 2 );

			// move elements into columns
			for ( i = 2; i <= columns; i++ ) {
				$(elm).find('> ul.col-1 > li.col-'+i).appendTo( $(elm).find('> ul.col-'+i) );
			}
		});
	};


	$.fn.jumboMenu.defaults = {
		columns: 3,
		timeout: 500
	};

})( jQuery, window );
