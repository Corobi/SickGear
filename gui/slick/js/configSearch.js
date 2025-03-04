/** @namespace $.SickGear.Root */
/** @namespace config.defaultHost */
$(document).ready(function(){

	var loading = '<img src="' + $.SickGear.Root + '/images/loading16' + themeSpinner + '.gif" height="16" width="16" />',
		handleSCGI = function() {
			var opts$ = $('#torrent-username-option,#torrent-password-option');
			$('#torrent_username,#torrent_password').each(function() {$(this).val(
				/^\s*scgi:\/\//.test($('#torrent_host').val()) ? opts$.hide() && $('#torrent_label').select() && ''
					: opts$.show() && $('#torrent_username').select() && $(this).prop('defaultValue'));});};

		$('#test-flaresolverr').click(function(){
		var host$ = $('#flaresolverr'), host = $.trim(host$.val()), result$ = $('#test-flaresolverr-result'),
			valid = !!host && -1 !== host.indexOf('http');
		if (!valid) {
			result$.html('Please correct the field above');
			if (!valid) {
				host$.addClass('warning');
			} else {
				host$.removeClass('warning');
			}
			return;
		}
		host$.removeClass('warning');
		$(this).prop('disabled', !0);
		result$.html(loading);
		$.get(sbRoot + '/home/test-flaresolverr',
			{host: host})
			.done(function (data) {
				$('#test-flaresolverr-result').html(data);
				$('#test-flaresolverr').prop('disabled', !1);
			});
	});

	function toggleTorrentTitle() {
		var noTorrent$ = $('#no_torrents');
		if ($('#use_torrents').prop('checked'))
			noTorrent$.show();
		else
			noTorrent$.hide();
	}

	$.fn.nzbMethodHandler = function() {

		var selectedProvider = $('#nzb_method').find(':selected').val(),
			blackholeSettings = '#blackhole-settings',
			nzbgetSettings = '#nzbget-settings, #test-nzb-result, .nzbget',
			sabnzbdSettings = '#sabnzbd-settings, #test-nzb-result, .sabnzbd';

		$('#test-sabnzbd-result').html('Click below to test');
		$([blackholeSettings, nzbgetSettings, sabnzbdSettings].join(',')).hide();

		if ('blackhole' == selectedProvider) {
			$(blackholeSettings).show();
		} else if ('nzbget' == selectedProvider) {
			$(nzbgetSettings).show();
		} else {
			$(sabnzbdSettings).show();
		}
	};
	$('#nzb_method').change($(this).nzbMethodHandler);
	$(this).nzbMethodHandler();

	$.fn.torrentMethodHandler = function() {

		var selectedProvider = $('#torrent_method').find(':selected').val(),
			host = ' host:port', username = ' username', password = ' password',
			label = ' label',
			directory = ' directory',
			client = '',
			hideHostDesc = !1, hidePausedOption = !1, hideLabelOption = !1, hidePathBlank = !1,
			optionsBlackhole = '#options-torrent-blackhole',
			optionsClients = '#options-torrent-clients',
			optionsPanel = optionsBlackhole;

		$(optionsBlackhole).hide();
		$(optionsClients).hide();

		$('#test-torrent-result').html('Click below to test');
		$('.default-host').html(config.defaultHost[selectedProvider]);

		if ('blackhole' != selectedProvider) {
			var labelWarningDeluge = '#label-warning-deluge',
				hostDesc = '#host-desc-torrent',
				hostDescDeluge = '#host-desc-deluge',
				hostDescRtorrent = '#host-desc-rtorrent',
				usernameOption = '#torrent-username-option',
				verifyCertOption = '#torrent-verify-cert-option',
				labelOption = '#torrent-label-option',
				qBitTorrent = '.qbittorrent',
				rTorrent = '.rtorrent',
				synology = '.synology',
				transmission = '.transmission',
				pathOption = '#torrent-path-option',
				pathBlank = '#path-blank',
				seedTimeOption = '#torrent-seed-time-option',
				pausedOption = '#torrent-paused-option',
				highBandwidthOption = '#torrent-high-bandwidth-option',
				torrentHost$ = $('#torrent_host');

			$([labelWarningDeluge, hostDescDeluge, hostDescRtorrent, verifyCertOption, seedTimeOption,
				highBandwidthOption, qBitTorrent, rTorrent, synology, transmission].join(',')).hide();

			$([hostDesc, usernameOption, pathOption, labelOption, pathBlank, pausedOption].join(',')).show();
			$(pathOption).find('.fileBrowser').show();

			torrentHost$.off('blur');

			switch (selectedProvider) {
				case 'utorrent':
					client = 'uTorrent';
					$(pathOption).hide();
					$(seedTimeOption).show();
					break;
				case 'deluge':
					client = 'Deluge'; hideHostDesc = !0;
					$(usernameOption).hide();
					$([hostDescDeluge, verifyCertOption, labelWarningDeluge].join(',')).show();
					break;
				case 'transmission':
					client = 'Transmission'; hideLabelOption = !0; hidePathBlank = !0;
					$([transmission, highBandwidthOption].join(',')).show();
					break;
				case 'qbittorrent':
					client = 'qBittorrent'; hidePathBlank = !0;
					$([qBitTorrent, highBandwidthOption].join(',')).show();
					break;
				case 'download_station':
					client = 'Synology DS'; hideLabelOption = !0;
					$(pathOption).find('.fileBrowser').hide();
					$(synology).show();
					break;
				case 'rtorrent':
					client = 'rTorrent'; hideHostDesc = !0;
					$([rTorrent, hostDescRtorrent].join(',')).show();
					torrentHost$.on('blur', handleSCGI);
					break;
			}
			hideHostDesc && $(hostDesc).hide();
			hideLabelOption && $(labelOption).hide();
			hidePausedOption && $(pausedOption).hide();
			hidePathBlank && $(pathBlank).hide();
			$('#host-title').text(client + host);
			$('#username-title').text(client + username);
			$('#password-title').text(client + password);
			$('#torrent-client').text(client);
			optionsPanel = optionsClients;
		}
		$(optionsPanel).show();
	};
	$('#torrent_method').change($(this).torrentMethodHandler);
	$(this).torrentMethodHandler();

	$('#use_torrents').click(function() {
		toggleTorrentTitle();
	});

	$.fn.testResult = function(data, test$) {
		// endpoint changed so gracefully handle 404s until restarted
		$(test$).html(/404/.test(data) ? 'Test not found, a restart should fix' : data);
	};

	$('#test_torrent').click(function() {
		$('#test-torrent-result').html(loading);
		var method = $('#torrent_method').find(':selected').val();
		(('rtorrent' === method) && handleSCGI());
		$.get(sbRoot + '/home/test-torrent',
			{'torrent_method': method, 'host': $('#torrent_host').val(),
				'username': $('#torrent_username').val(), 'password': $('#torrent_password').val()},
				function(data) { $(this).testResult(data, '#test-torrent-result'); });
	});

	$('#test_nzbget').click(function() {
		$('#test-nzb-result').html(loading);
		$.get(sbRoot + '/home/test-nzbget',
			{'host': $('#nzbget_host').val(), 'use_https': $('#nzbget_use_https').prop('checked'),
				'username': $('#nzbget_username').val(), 'password': $('#nzbget_password').val()},
			function(data) { $(this).testResult(data, '#test-nzb-result'); });
	});

	$('#test_sabnzbd').click(function() {
		$('#test-nzb-result').html(loading);
		$.get(sbRoot + '/home/test-sabnzbd',
			{'host': $('#sab_host').val(), 'username': $('#sab_username').val(),
				'password': $('#sab_password').val(), 'apikey': $('#sab_apikey').val()},
			function(data) { $(this).testResult(data, '#test-nzb-result'); });
	});

});
