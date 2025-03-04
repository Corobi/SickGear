/** @namespace $.SickGear.Root */
/** @namespace content.path */
/** @namespace content.hSize */
/** @namespace content.nFiles */
/** @namespace content.hLargest */
/** @namespace content.hSmallest */
/** @namespace content.hAverageSize */

function initActions() {
	var menu$ = $('#SubMenu');
	menu$.find('a[href*="/home/restart/"]').addClass('btn restart').html('<i class="sgicon-restart"></i>Restart');
	menu$.find('a[href*="/home/shutdown/"]').addClass('btn shutdown').html('<i class="sgicon-shutdown"></i>Shutdown');
	menu$.find('a[href*="/home/logout/"]').addClass('btn').html('<i class="sgicon-logout"></i>Logout');
	menu$.find('a:contains("Edit")').addClass('btn').html('<i class="sgicon-edit"></i>Edit');
	menu$.find('a:contains("Remove")').addClass('btn remove').html('<i class="sgicon-delete"></i>Remove');
	menu$.find('a:contains("Clear History")').addClass('btn clearhistory').html('<i class="sgicon-delete"></i>Clear History');
	menu$.find('a:contains("Trim History")').addClass('btn trimhistory').html('<i class="sgicon-trim"></i>Trim History');
	menu$.find('a[href$="/events/download-log/"]').addClass('btn').html('<i class="sgicon-download"></i>Download Log');
	menu$.find('a[href$="/errors/clear-log/"]').addClass('btn').html('<i class="sgicon-delete"></i>Clear Errors');
	menu$.find('a:contains("Re-scan")').addClass('btn').html('<i class="sgicon-refresh"></i>Re-scan');
	menu$.find('a:contains("Backlog Overview")').addClass('btn').html('<i class="sgicon-backlog"></i>Backlog Overview');
	menu$.find('a[href$="/home/update-plex/"]').addClass('btn').html('<i class="sgicon-plex"></i>Update PLEX');
	menu$.find('a:contains("Force")').addClass('btn').html('<i class="sgicon-fullupdate"></i>Full Update');
	menu$.find('a:contains("Rename")').addClass('btn').html('<i class="sgicon-rename"></i>Media Rename');
	menu$.find('a[href$="/config/subtitles/"]').addClass('btn').html('<i class="sgicon-subtitles"></i>Subtitles');
	menu$.find('a[href*="/home/subtitle-show"]').addClass('btn').html('<i class="sgicon-subtitles"></i>Download Subtitles');
	menu$.find('a:contains("Anime")').addClass('btn').html('<i class="sgicon-anime"></i>Anime');
	menu$.find('a:contains("Search")').addClass('btn').html('<i class="sgicon-search"></i>Search');
	menu$.find('a:contains("Provider")').addClass('btn').html('<i class="sgicon-book"></i>Media Providers');
	menu$.find('a:contains("General")').addClass('btn').html('<i class="sgicon-config"></i>General');
	menu$.find('a:contains("Episode Overview")').addClass('btn').html('<i class="sgicon-episodestatus"></i>Episode Overview');
	menu$.find('a:contains("Subtitles Missed")').addClass('btn').html('<i class="sgicon-subtitles"></i>Subtitles Missed');
	menu$.find('a[href$="/config/media-process/"]').addClass('btn').html('<i class="sgicon-postprocess"></i>Media Process');
	menu$.find('a[href$="/process-media/"]').addClass('btn').html('<i class="sgicon-postprocess"></i>Process Media');
	menu$.find('a:contains("Search")').addClass('btn').html('<i class="sgicon-search"></i>Search Tasks');
	menu$.find('a:contains("Manage Torrents")').addClass('btn').html('<i class="sgicon-bittorrent"></i>Manage Torrents');
	menu$.find('a:contains("Show Tasks")').addClass('btn').html('<i class="sgicon-showqueue"></i>Show Tasks');
	menu$.find('a[href$="/manage/failed-downloads/"]').addClass('btn').html('<i class="sgicon-failed"></i>Failed Downloads');
	menu$.find('a:contains("Notification")').addClass('btn').html('<i class="sgicon-notification"></i>Notifications');
	menu$.find('a[href$="/home/update-mb/"]').addClass('btn').html('<i class="sgicon-emby"></i>Update Emby');
	menu$.find('a[href$="/home/update-kodi/"]').addClass('btn').html('<i class="sgicon-kodi"></i>Update Kodi');
	// menu$.find('a[href$="/home/update-xbmc/"]').addClass('btn').html('<i class="sgicon-xbmc"></i>Update XBMC');
	menu$.find('a:contains("Update show in Emby")').addClass('btn').html('<i class="sgicon-emby"></i>Emby Update Show');
	menu$.find('a:contains("Update show in Kodi")').addClass('btn').html('<i class="sgicon-kodi"></i>Kodi Update Show ');
	// menu$.find('a:contains("Update show in XBMC")').addClass('btn').html('<i class="sgicon-xbmc"></i>Update show in XBMC');
}

$(function(){
	initActions();
	$('#NAV' + topmenu).addClass('active');
	$('.dropdown-toggle').dropdownHover();
	(/undefined/i.test(document.createElement('input').placeholder)) && $('body').addClass('no-placeholders');

	$('.bubblelist').on('click', '.list .item a', function(){
		var bubbleAfter$ = $('#bubble-after'),
			lastBubble$ = $('.bubble.last'), toBubble = $(this).attr('href').replace('#', ''),
			doLast = (lastBubble$.length && toBubble === lastBubble$.find('div[name*="section"]').attr('name'));

		doLast && lastBubble$.removeClass('last');
		(bubbleAfter$.length && bubbleAfter$ || $(this).closest('.component-group')).after(
			$('[name=' + $(this).attr('href').replace('#','') + ']').closest('.component-group')
		);
		doLast && $('.bubble').last().addClass('last');
		return !1;
	});

	var search = function(){
		var link$ = $('#add-show-name'), text = encodeURIComponent(link$.find('input').val()),
			param = '?show_to_add=|||' + text + '&use_show_name=True';
		window.location.href = link$.attr('data-href') + (!text.length ? '' : param);
	}, removeHref = function(){$('#add-show-name').removeAttr('href');};
	$('#add-show-name')
		.on('click', function(){ search(); })
		.hover(function() {$(this).attr('href', $(this).attr('data-href'));}, removeHref);
	$('#add-show-name input')
		.hover(removeHref)
		.on('click', function(e){ e.stopPropagation(); })
		.on('focus', function(){$.SickGear.PauseCarousel = !0;})
		.on('blur', function(){delete $.SickGear.PauseCarousel;})
		.keydown(function(e){
			if (13 === e.keyCode) {
				e.stopPropagation();
				e.preventDefault();
				search();
				return !1;
			}
		});

	$('#NAVhome').find('.dropdown-menu li a#add-view')
		.on('click', function(e){
			e.stopPropagation();
			e.preventDefault();
			var that = $(this), view=['add-tab1', 'add-tab2', 'add-tab3'], i, is, to;
			for(i = 0; i < view.length; i++){
				if (view[i] === that.attr('data-view')){
					is = view[i];
					to = view[((i + 1) === view.length) ? 0 : i + 1];
					break;
				}
			}
			that.attr('data-view', to);
			that.closest('.dropdown-menu')
				.find('.' + is).fadeOut('fast', 'linear', function(){
					that.closest('.dropdown-menu')
						.find('.' + to).fadeIn('fast', 'linear', function(){
							return !1;
					});
				});
		})

	$('[data-size] .ui-size, #data-size').each(function(){
		$(this).qtip({
			content:{
				text: function(event, api){
					// deferred object ensuring the request is only made once
					var tvidProdid = $('#tvid-prodid').val(), tipText = '';
					if (/undefined/i.test(tvidProdid)){
						tvidProdid = $(event.currentTarget).closest('[data-tvid_prodid]').attr('data-tvid_prodid');
					}
					$.getJSON($.SickGear.Root + '/home/media_stats', {tvid_prodid: tvidProdid})
						.then(function(content){
							// on success...
							if (/undefined/.test(content[tvidProdid].message)){
								tipText = (1 === content[tvidProdid].nFiles
									? '<span class="grey-text">One media file,</span> ' + content[tvidProdid].hAverageSize
									: '' + content[tvidProdid].nFiles + ' <span class="grey-text">media files,</span>'
										+ ((content[tvidProdid].hLargest === content[tvidProdid].hSmallest)
											? (content[tvidProdid].hAverageSize + ' <span class="grey-text">each</span>')
											: ('<br><span class="grey-text">largest</span> ' + content[tvidProdid].hLargest + ' <span class="grey-text">(<span class="tip">></span>)</span>'
												+ '<br><span class="grey-text">smallest</span> ' + content[tvidProdid].hSmallest + ' <span class="grey-text">(<span class="tip"><</span>)</span>'
												+ '<br><span class="grey-text">average size</span> ' + content[tvidProdid].hAverageSize + ' <span class="grey-text">(<span class="tip-average"><i>x</i></span>)</span>')));
							} else {
								tipText = '<span class="grey-text">' + content[tvidProdid].message + '</span>';
							}
							api.set('content.text',
								tipText + '<div style="width:100%; border-top:1px dotted; margin-top:3px"></div>'
										+ '<div style="margin-top:3px">' + '<span class="grey-text">location size</span> ' + content[tvidProdid].hSize + ' <span class="grey-text">(<span class="tip">&Sigma;</span>)</span>' + '</div>'
										+ content[tvidProdid].path);
						}, function(xhr, status, error){
								// on fail...
								api.set('content.text', status + ': ' + error);
						});
					return 'Loading...'; // set initial text
				}
			},
			show: {solo: true},
			position: {viewport: $(window), my: 'left center', adjust: {y: -10, x: 0}},
			style: {classes: 'qtip-dark qtip-rounded qtip-shadow'}
		});
	});

});
