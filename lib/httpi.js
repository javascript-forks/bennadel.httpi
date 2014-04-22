;(function( ng ) {

	"use strict";

	// Define our AngularJS module.
	var module = ng.module( "httpi", [] );


	// I provide a light-weight proxy for the $http service that will interpolate the 
	// URL using the configuration-based params and data collections. 
	module.factory(
		"httpi",
		function( $http, HttpiResource ) {

			// I proxy the $http service and merge the params and data values into 
			// the URL before creating the underlying request.
			function httpProxy( config ) {

				config.url = interpolateUrl( config.url, config.params, config.data );

				return( $http( config ) );

			}


			// I create a new Httpi Resource for the given URL.
			httpProxy.resource = function( url ) {

				return( new HttpiResource( httpProxy, url ) );

			};


			// Return the factory value.
			return( httpProxy );


			// ---
			// PRIVATE METHODS.
			// ---


			// I move values from the params and data arguments into the URL where 
			// there is a match for labels. When the match occurs, the key-value 
			// pairs are removed from the parent object and merged into the string
			// value of the URL.
			function interpolateUrl( url, params, data ) {

				// Make sure we have an object to work with - makes the rest of the
				// logic easier. 
				params = ( params || {} );
				data = ( data || {} );

				// Strip out the delimiter fluff that is only there for readability
				// of the optional label paths.
				url = url.replace( /(\(\s*|\s*\)|\s*\|\s*)/g, "" );

				// Replace each label in the URL (ex, :userID).
				url = url.replace(
					/:([a-z]\w*)/gi,
					function( $0, label ) {

						// NOTE: Giving "data" precedence over "params".
						return( popFirstKey( data, params, label ) || "" );

					}
				);

				// Strip out any repeating slashes (but NOT the http:// version).
				url = url.replace( /(^|[^:])[\/]{2,}/g, "$1/" );

				// Strip out any trailing slash.
				url = url.replace( /\/+$/i, "" );

				return( url );

			}


			// I take 1..N objects and a key and perform a popKey() action on the 
			// first object that contains the given key. If other objects in the list
			// also have the key, they are ignored.
			function popFirstKey( object1, object2, objectN, key ) {

				// Convert the arguments list into a true array so we can easily 
				// pluck values from either end.
				var objects = Array.prototype.slice.call( arguments );

				// The key will always be the last item in the argument collection.
				var key = objects.pop();

				var object = null;

				// Iterate over the arguments, looking for the first object that
				// contains a reference to the given key.
				while ( object = objects.shift() ) {

					if ( object.hasOwnProperty( key ) ) {

						return( popKey( object, key ) );

					}

				}

			}


			// I delete the key from the given object and return the value.
			function popKey( object, key ) {

				var value = object[ key ];

				delete( object[ key ] );

				return( value );

			}

		}
	);


	// I provide a proxy for the given http service that injects the same URL in every
	// one of the outgoing requests. It is intended to be used with "httpi", but it has
	// no direct dependencies other than the general format of the $http configuration.
	module.factory(
		"HttpiResource",
		function() {

			// I provide a resource that injects the given URL into the configuration
			// object before passing it off to the given http service.
			function Resource( http, url ) {

				// Store the http service.
				this.http = http;

				// Store the URL to inject.
				this.url = url;

				return( this );

			}


			// Define the instance methods.
			Resource.prototype = {

				// We have to explicitly set the constructor since we are overriding the
				// prototype object (which naturally holds the constructor).
				constructor: Resource,


				// I execute a DELETE request and return the http promise.
				delete: function( config ) {

					// Inject resource-related properties.
					config.method = "delete";
					config.url = this.url;

					return( this.http( config ) );

				},


				// I execute a GET request and return the http promise.
				get: function( config ) {

					// Inject resource-related properties.
					config.method = "get";
					config.url = this.url;

					return( this.http( config ) );

				},


				// I execute a HEAD request and return the http promise.
				head: function( config ) {

					// Inject resource-related properties.
					config.method = "head";
					config.url = this.url;

					return( this.http( config ) );

				},


				// I execute a JSONP request and return the http promise.
				jsonp: function( config ) {

					// Inject resource-related properties.
					config.method = "jsonp";
					config.url = this.url;

					// Make sure the JSONP callback is defined somewhere in the config 
					// object (AngularJS needs this to define the callback handle).
					this.paramJsonpCallback( config );

					return( this.http( config ) );

				},


				// I make sure the callback marker is defined for the given JSONP request
				// configuration object.
				paramJsonpCallback: function( config ) {

					var callbackName = "JSON_CALLBACK";

					// Check to see if it's in the URL already.
					if ( this.url.indexOf( callbackName ) !== -1 ) {
						
						return;

					}

					// Check to see if it's in the params already.
					if ( config.params ) {

						for ( var key in config.params ) {

							if ( 
								config.params.hasOwnProperty( key ) && 
								( config.params[ key ] === callbackName )
								) {

								return;

							}

						}

					// If there are no params, then make one so that we have a place to
					// inject the callback.
					} else {

						config.params = {}

					}

					// If we made it this far, then the current configuration does not
					// account for the JSONP callback. As such, let's inject it into the
					// params.
					config.params.callback = callbackName;

				},


				// I execute a POST request and return the http promise.
				post: function( config ) {

					// Inject resource-related properties.
					config.method = "post";
					config.url = this.url;

					return( this.http( config ) );

				},


				// I execute a PUT request and return the http promise.
				put: function( config ) {

					// Inject resource-related properties.
					config.method = "put";
					config.url = this.url;

					return( this.http( config ) );

				}

			};


			// Return the constructor as the AngularJS factory result.
			return( Resource );

		}
	);

})( angular );