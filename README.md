Tracetool
=========

Traceroute utility to record a bunch of traceroutes in JSON format
under `db/` and provide methods for analyzing those traces and detect
network changes over time.

Author
------
pancake <pancake@nopcode.org>

Usage
-----

	$ node trace.js google.com

Analyzing:

	$ node query.js -t google.com
	...
