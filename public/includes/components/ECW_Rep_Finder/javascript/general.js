(function( $, window, undefined ) {

	"use strict";

	window.ECWRepFinder = {

		default_map  : null,
		current_map  : null,
		map_files    : null,
		request_uri  : null,
		ajax_uri     : null,
		param_prefix : null,

		dir_map_pack   : null,
		dir_simplemaps : null,

		back_btn_selector : "#ecwrf_back",

		DEBUG_LVL   : 0,

		init : function() {
			this.debug("Init");

			var map = this.url_param("map");
			this.current_map = map || this.default_map;

			this.ajax_uri = this.ajax_uri || this.request_uri;

			this.loadmap( this.current_map );
		},

		/**
		 *	dynamically load map javascript files
		 */
		loadmap : function( map ) {
			this.debug("Loading '"+map+"'");

			var map_files = [], idx, self = this,
				finished = function(){
					var region = self.url_param('region');

					window[self.map_files[map].prefix]();  // call simplemap function
					self.debug("Finished loading map.");

					if ( region !== undefined ) {
						window[self.map_files[map].prefix+'_zoom'](region);
					}

					self.update_history( map, region );

					if ( self.current_map != self.default_map ) {
						$(self.back_btn_selector).show();
					} else {
						$(self.back_btn_selector).hide();
					}
				};

			if ( window[self.map_files[map].prefix] === undefined ) {
				for ( idx = 0; idx < this.map_files[map]['code'].length; idx++ ) {
					map_files.push( this.dir_map_pack + this.map_files[map]['code'][idx] );  // javascript code file(s)
				}
				map_files.push( this.href( this.ajax_uri, {"mapdata":map} ) );              // server-side built mapdata
				map_files.push( this.dir_simplemaps + this.map_files[map]['simplemap'] );   // simplemap code

				this.loadJS( map_files, finished );
			} else {
				finished();
			}
		},

		/**
		 *	redirect to territory info
		 */
		view_territory : function( id ) {
			var mapdata = window[this.map_files[this.current_map].prefix+'_mapdata'];

			this.debug( mapdata.state_specific[id], 2 );

			window.location.href = this.href( this.request_uri, {"code":mapdata.state_specific[id].territories} );
		},

		/**
		 * update current url (without reloading)
		 */
		update_history :  function( map, region ) {
			map    = map || this.current_map;
			region = ( region === undefined || region === null ) ? null : region;

			var url, params;

			this.current_map = map;

			if (history.pushState) {
				this.debug("Update History");

				params = { "map":map };
				if ( region !== null ) { params.region = region; }

				url = this.href( this.request_uri, params );

				this.debug({"url":url,"params":params},2);

				history.pushState(params, "ECWRepFinder - Map:"+map+" Region:"+region, url);
			}
		},

		/**
		 * Append a query string to a url, even if that url currently has one
		 *
		 * @param  String  url     a url with or without a query string
		 * @param  Object  params  an associative array to be turned into a query string
		 *
		 * @return String
		 */
		href : function( url, params ) {
			var sep, href, query = "", key;

			sep  = ( url.indexOf('?') === -1 ) ? '?' : '&';
			href = url;

			for ( key in params ) {
				query += this.param_prefix + key + "=" + encodeURIComponent( String(params[key]) );
			}

			if ( query.length ) {
				href = href + sep + query;
			}

			return href;
		},

		/**
		 * Load the default map
		 */
		back : function() {
			this.loadmap( this.default_map );
		},

		/**
		 * return value of url parameter
		 */
		url_param : function( name ) {
			name = this.param_prefix + name;
			var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
			return ( results == null ) ? undefined : decodeURIComponent(results[1]);
		},

		/**
		 * Set DEBUG_LVL and Show/Hide debugging DOM Elements
		 */
		setDebugLevel : function( level ) {
			level = parseInt( level, 10 );
			this.DEBUG_LVL = isNaN(level) ? 0 : level;

			if ( this.DEBUG_LVL > 0 ) {
				$('.debug').show();
			} else {
				$('.debug').hide();
			}
		},

		/**
		 * Display message to console.log if DEBUG_LVL is high enough
		 */
		debug : function( output, level ) {
			if ( typeof level === "undefined" ) level = 1;

			if ( typeof output === 'string' ) { output = "ECWRepFinder: " + output };

			if ( typeof this.DEBUG_LVL !== "undefined" && this.DEBUG_LVL >= level ) {
				try {
					console.log( output );
				} catch (e) {
					// create a makeshift console
					if ( $('textarea#debugConsole').length < 1 ) {
						var debugConsoleBlock = $('<div/>').appendTo('body');
						$('<a/>',{"href":"#","onclick":"$('textarea#debugConsole').toggle();","text":"[ DEBUG: toggle console ]","style":"font-size:small;"}).appendTo( debugConsoleBlock );
						$('<textarea/>',{"id":"debugConsole","rows":24,"style":"display:none;width:99%;margin-bottom:3em;"}).appendTo( debugConsoleBlock );
					}
					if ( typeof output === "object" ) { output = JSON.stringify(output); }
					$('textarea#debugConsole').val( $('textarea#debugConsole').val() + "\n" + output );
					setTimeout(function() {
						 var textArea = document.getElementById('debugConsole');
						 textArea.scrollTop = textArea.scrollHeight;
					}, 10);
				}
			}
		},


		// recursive ajax (based on code from from http://stackoverflow.com/a/4414911)
		recursiveAjax : function( arrSettings, commonSettings, raData ) {
			if ( typeof raData === "undefined" ) raData = { total: arrSettings.length };
			raData.index = raData.total - arrSettings.length;
			var currentSettings = arrSettings.shift(); // Remove the first item from the Array.
			var defaultSettings = { success: function(){}, raTimeout: 100, raFinished: function( raData ){/* do nothing */} };
			var settings        = $.extend( {}, defaultSettings, commonSettings, currentSettings );
			var self = this;

			setTimeout( function() {

				$.ajax($.extend({},settings,{
					success: function( data, textStatus, jqXHR ) {
						settings.success( data, textStatus, jqXHR, raData );
						if( arrSettings.length ) {
							self.recursiveAjax( arrSettings, commonSettings, raData );  // If there are items left in the Array, make a recursive call
						} else {
							settings.raFinished( raData );
						}
					}
				}));

			}, settings.raTimeout);
		},

		loadJS : function( arr_src, func_complete ) {
			var idx, data = [], self = this,
				shared = { cache: true, dataType: "script", raFinished: func_complete, raTimeout: 50 };

			//this.debug(arr_src);

			for ( idx = 0; idx < arr_src.length; idx++ ) {
				data.push( { url: arr_src[idx] } );
			}

			this.recursiveAjax( data, shared );
		}

	};

})( jQuery, window );

$(document).ready(function() {
	$(window).resize(function() {
		var maxWidth = 910,
			browserWidth = $(window).width();
		if (browserWidth >= 990) {
			$("#ecw_rep_map_inner > svg").attr('width', maxWidth)
			$("#ecw_rep_map_inner > svg").attr('height', maxWidth / 1.76923)
		} else {
			$("#ecw_rep_map_inner > svg").attr('width', browserWidth - 30)
			$("#ecw_rep_map_inner > svg").attr('height', (browserWidth - 30) / 1.76923)
		}
	});
});