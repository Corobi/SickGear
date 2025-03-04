function toggle$(el, cond){
	var ifId = '-if-' + $(el).attr('id');
	if(cond){
		$('.hide' + ifId).fadeOut('fast', 'linear');
		$('.show' + ifId).fadeIn('fast', 'linear');
	} else {
		$('.show' + ifId).fadeOut('fast', 'linear');
		$('.hide' + ifId).fadeIn('fast', 'linear');
	}
}

function viewsIf(){
	var that, className, done = [], target;
	$('[class*="views-if"]').each(function(){
		that = this;
		$.each(that.classList, function(){
			if(/views-if-/i.test(this)){
				className = this.replace('views-if-', '');
				if (-1 === $.inArray(className, done)){
					done.push(className);
					target = '[class*="show-if-' + className + '"]';
					if ($('[class*="views-if-' + className + '"]:checked').length){
						$(target).fadeIn('fast', 'linear');
					} else {
						$(target).fadeOut('fast', 'linear');
					}
				}
			}
		});
	});
}

$(document).ready(function () {
	var enabler = $('.enabler'),
		viewIf = $('input.view-if'),
		viewIfSel = $('select.view-if');

	enabler.each(function () {
		if (!$(this).prop('checked'))
			$(document.getElementById('content_' + $(this).attr('id'))).hide();
	});

	enabler.click(function () {
		var content_id = $(document.getElementById('content_' + $(this).attr('id')));
		if ($(this).prop('checked'))
			content_id.fadeIn('fast', 'linear');
		else
			content_id.fadeOut('fast', 'linear');
	});

	$('[class*="views-if"]').on({click: viewsIf});
	viewsIf();

	viewIf.each(function () {
		$(($(this).prop('checked') ? '.hide-if-' : '.show-if-') + $(this).attr('id')).hide();
	});

	viewIf.click(function () {
		toggle$(this, $(this).prop('checked'));
	});

	viewIfSel.each(function () {
		$((0 < $(this).find('option:selected').val() ? '.hide-if-' : '.show-if-') + $(this).attr('id')).hide();
	});

	viewIfSel.change(function(){
		toggle$(this, 0 < $(this).find('option:selected').val());
	});

	/** @namespace data.names */
	/** @namespace data.numbers */
	/** @namespace data.min_remain_iv */
	$('input#alias').on('click', function() {
		var result$ = $('#alias-result'), that$ = $(this);
		that$.attr('disabled', 'disabled');
		result$.html('checking for updates...');
		$.getJSON(sbRoot + '/config/general/update-alt',
			function (data) {
				var output = 'checked, ', remain;
				result$.removeClass('grey-text');
				if (data.names) {
					output += 'new alias names found';
					result$.addClass('grey-text');
				} else if (!data.numbers) {
					output += 'no updates found';
				}
				if (data.numbers) {
					output += (data.names ? ' and ' : '') + data.numbers + ' alternative numbers updated';
					result$.addClass('grey-text');
				}
				remain = data.min_remain_iv/60;
				output += ', wait ' + parseInt(remain) + 'm before next fetch process'
				result$.html(output);
				that$.removeAttr('disabled');
			});
	});

	var idSelect = '#imdb-accounts', idDel = '#imdb-list-del', idInput = '#imdb-url', idOnOff = '#imdb-list-onoff',
		sel = 'selected', opt = 'option', selOpt = [opt, sel].join(':'),
		elDropDown = $(idSelect), elDel = $(idDel), elInput = $(idInput), elOnOff = $(idOnOff);

	function accId() {return elDropDown.find(selOpt).val();}
	function nameList() {return elDropDown.find(selOpt).text();}
	function isAdd() {return 'new' === accId();}
	function isOff() {return 0 == nameList().indexOf('(Off) ');}
	function warnMessage(msg) { elInput.addClass('warning').prop('title', msg); }
	function all(state) {$([idSelect, idDel, idInput, idOnOff].join()).prop('disabled', 'on' == state ? !1 : !0)}
	function setOnOff() {elOnOff.val(isAdd() || isOff() ? 'Enable' : 'Disable');}
	function setLink() {
		var idView = '#view-list', idLink = '#link-list';
		return $([idView, idLink].join()).removeClass() &&
			((isAdd() || isOff()) && $(idLink).addClass('hide') || $(idView).addClass('hide')) &&
			(!isOff() && $(idLink)
				.attr('href', sbRoot + '/add-shows/watchlist-imdb?account=' + accId())
				.attr('title', 'View ' + nameList()));
	}

	function defaultControls() {
		elDel.prop('disabled', isAdd());
		elInput.removeClass('warning')
			.val(!isAdd() && accId() || '')
			.prop('title', isAdd() ? '' : 'Select Add. Use Delete or Disable')
			.prop('readonly', !isAdd());
		setOnOff();
		setLink();
	}

	function populateSelect(jsonData) {
		/** @namespace response.accounts */
		var response = $.parseJSON(jsonData);

		if ('Success' !== response.result) {
			warnMessage(response.result);
			return !1;
		}

		elDropDown.find(opt).slice(1).remove();
		var i, l, accounts = response.accounts, options = elDropDown.get(0).options;
		for (i = 0, l = accounts.length; i < l; i = i + 2) {
			options[options.length] = new Option(accounts[i + 1] +
				(0 == accounts[i + 1].replace('(Off) ', '').toLowerCase().indexOf('your') ? '' : '\'s') + ' list', accounts[i]);
			if (0 <= $.trim(elInput.val()).indexOf(accounts[i])) {
				elDropDown.find(opt).prop(sel, !1);
				elDropDown.find('option[value="' + accounts[i] + '"]').prop(sel, sel);
				elInput.val(accounts[i]);
				elInput.prop('title', 'Select Add. Use Delete or Disable');
				setOnOff();
			}
		}
		return !0;
	}

	elDropDown.change(function() {
		defaultControls();
	});

	elDel.on('click', function(e) {
		all('off');
		$.confirm({
			'title'		: 'Remove the "' + nameList().replace('\'s', '').replace(' list', '') + '" IMDb Watchlist',
			'message'	: 'Are you sure you want to remove <span class="footerhighlight">' + nameList() + '</span> ?<br /><br />',
			'buttons'	: {
				'Yes'	: {
					'class'	: 'green',
					'action': function() {
						all('off');
						$.get(sbRoot + '/add-shows/watchlist-imdb', {
							'action': elDel.val().toLowerCase(),
							'select': accId()})
							.done(function(response) {
								all('on'); setControls(!populateSelect(response), !1); setOnOff(); })
							.fail(function() {
								all('on'); setControls(!0, 'Invalid ID'); setOnOff(); });
					}
				},
				'No'	: {
					'class'	: 'red',
					'action': function() { e.preventDefault(); all('on'); defaultControls();}
				}
			}
		});
	});

	elOnOff.on('click', function(e) {
		var strList = $.trim(elInput.val());

		elInput.removeClass('warning');
		if (!strList) {
			warnMessage('Missing IMDb list Id or URL');
		} else {
			all('off');
			var params = {'action': elOnOff.val().toLowerCase()};
			if ('enable' == params.action)
				params.input = strList;
			else
				params.select = accId();

			$.get(sbRoot + '/add-shows/watchlist-imdb', params)
				.done(function(data) { setControls(!populateSelect(data), !1); })
				.fail(function() { setControls(!0, 'Failed to load list'); });
		}
	});

	function setControls(resetSelect, message) {
		all('on');
		if (resetSelect) {
			if (message)
				warnMessage(message);
			var addList = '[value="new"]';
			elDropDown.find(opt).not(addList).prop(sel, !1);
			elDropDown.find(opt + addList).prop(sel, sel);
		}
		elDel.prop('disabled', isAdd());
		elInput.prop('readonly', !isAdd());
		setLink()
	}

	var ui_update_trim_zero = (function () {
		var secs = ('00' + new Date().getSeconds().toString()).slice(-2),
			elSecs = $('#trim_info_seconds'),
			elTrimZero = $('#trim_zero');
		elTrimZero.each(function () {
			var checked = $(this).prop('checked') && $('#fuzzy_dating').prop('checked');

			$('#time_presets').find('option').each(function () {
				var text = ($(this).text());
				$(this).text(checked
					? text.replace(/(\b\d+:\d\d):\d+/mg, '$1')
					: text.replace(/(\b\d+:\d\d)(?:.\d+)?/mg, '$1:' + secs));
			});
		});

		if ($('#fuzzy_dating').prop('checked'))
			if (elTrimZero.prop('checked'))
				elSecs.fadeOut('fast', 'linear');
			else
				elSecs.fadeIn('fast', 'linear');
		else
			elSecs.fadeIn('fast', 'linear');
	});

	$('#trim_zero, #fuzzy_dating').click(function () {
		ui_update_trim_zero();
	});

	ui_update_trim_zero();

	$('.datePresets').click(function () {
		var elDatePresets = $('#date_presets'),
			defaultPreset = elDatePresets.val();
		if ($(this).prop('checked') && '%x' == defaultPreset) {
			defaultPreset = '%a, %b %d, %Y';
			$('#date_use_system_default').html('1')
		} else if (!$(this).prop('checked') && '1' == $('#date_use_system_default').html())
			defaultPreset = '%x';

		elDatePresets.attr('name', 'date_preset_old');
		elDatePresets.attr('id', 'date_presets_old');

		var elDatePresets_na = $('#date_presets_na');
		elDatePresets_na.attr('name', 'date_preset');
		elDatePresets_na.attr('id', 'date_presets');

		var elDatePresets_old = $('#date_presets_old');
		elDatePresets_old.attr('name', 'date_preset_na');
		elDatePresets_old.attr('id', 'date_presets_na');

		if (defaultPreset)
			elDatePresets.val(defaultPreset)
	});

	// bind 'myForm' and provide a simple callback function
	$('#configForm').ajaxForm({
		beforeSubmit: function () {
			$('.config_submitter').each(function () {
				$(this).attr('disabled', 'disabled');
				$(this).after('<span><img src="' + sbRoot + '/images/loading16' + themeSpinner + '.gif"> Saving...</span>');
				$(this).hide();
			});
			$('.show_update_hour_value').text($('#show_update_hour').val())
		},
		success: function (response) {
			setTimeout(function () {config_success(response)}, 2000);
		}
	});

	var addQR = function(){
		if (0 < $('a[rel=qr]').length) {
			var fancy = sbRoot + '/js/fancybox/jquery.fancybox';
			$.getScript(fancy + '.js', function () {
				var head$ = $('head');
				if (!head$.find('link[href*="fancybox"]').length){
					head$.append('<link rel="stylesheet" href="' + fancy + '.css">');
					!function(t,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define("jquery-qrcode",[],r):"object"==typeof exports?exports["jquery-qrcode"]=r():t["jquery-qrcode"]=r()}("undefined"!=typeof self?self:this,function(){return function(e){var n={};function o(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,o),r.l=!0,r.exports}return o.m=e,o.c=n,o.d=function(t,r,e){o.o(t,r)||Object.defineProperty(t,r,{enumerable:!0,get:e})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(r,t){if(1&t&&(r=o(r)),8&t)return r;if(4&t&&"object"==typeof r&&r&&r.__esModule)return r;var e=Object.create(null);if(o.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:r}),2&t&&"string"!=typeof r)for(var n in r)o.d(e,n,function(t){return r[t]}.bind(null,n));return e},o.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(r,"a",r),r},o.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},o.p="",o(o.s=0)}([function(v,t,p){(function(t){function c(t){return t&&"string"==typeof t.tagName&&"IMG"===t.tagName.toUpperCase()}function a(t,r,e,n){var o={},i=p(2);i.stringToBytes=i.stringToBytesFuncs["UTF-8"];var a=i(e,r);a.addData(t),a.make(),n=n||0;var u=a.getModuleCount(),s=u+2*n;return o.text=t,o.level=r,o.version=e,o.module_count=s,o.is_dark=function(t,r){return r-=n,0<=(t-=n)&&t<u&&0<=r&&r<u&&a.isDark(t,r)},o.add_blank=function(a,u,f,c){var l=o.is_dark,g=1/s;o.is_dark=function(t,r){var e=r*g,n=t*g,o=e+g,i=n+g;return l(t,r)&&(o<a||f<e||i<u||c<n)}},o}function h(t,r,e,n,o){e=Math.max(1,e||1),n=Math.min(40,n||40);for(var i=e;i<=n;i+=1)try{return a(t,r,i,o)}catch(t){}}function i(t,r,e){c(e.background)?r.drawImage(e.background,0,0,e.size,e.size):e.background&&(r.fillStyle=e.background,r.fillRect(e.left,e.top,e.size,e.size));var n=e.mode;1===n||2===n?function(t,r,e){var n=e.size,o="bold "+e.mSize*n+"px "+e.fontname,i=d("<canvas/>")[0].getContext("2d");i.font=o;var a=i.measureText(e.label).width,u=e.mSize,f=a/n,c=(1-f)*e.mPosX,l=(1-u)*e.mPosY,g=c+f,s=l+u;1===e.mode?t.add_blank(0,l-.01,n,s+.01):t.add_blank(c-.01,l-.01,.01+g,s+.01),r.fillStyle=e.fontcolor,r.font=o,r.fillText(e.label,c*n,l*n+.75*e.mSize*n)}(t,r,e):!c(e.image)||3!==n&&4!==n||function(t,r,e){var n=e.size,o=e.image.naturalWidth||1,i=e.image.naturalHeight||1,a=e.mSize,u=a*o/i,f=(1-u)*e.mPosX,c=(1-a)*e.mPosY,l=f+u,g=c+a;3===e.mode?t.add_blank(0,c-.01,n,g+.01):t.add_blank(f-.01,c-.01,.01+l,g+.01),r.drawImage(e.image,f*n,c*n,u*n,a*n)}(t,r,e)}function l(t,r,e,n,o,i,a,u){t.is_dark(a,u)&&r.rect(n,o,i,i)}function g(t,r,e,n,o,i,a,u){var f=t.is_dark,c=n+i,l=o+i,g=e.radius*i,s=a-1,h=a+1,d=u-1,v=u+1,p=f(a,u),w=f(s,d),y=f(s,u),m=f(s,v),b=f(a,v),k=f(h,v),C=f(h,u),B=f(h,d),x=f(a,d);p?function(t,r,e,n,o,i,a,u,f,c){a?t.moveTo(r+i,e):t.moveTo(r,e),u?(t.lineTo(n-i,e),t.arcTo(n,e,n,o,i)):t.lineTo(n,e),f?(t.lineTo(n,o-i),t.arcTo(n,o,r,o,i)):t.lineTo(n,o),c?(t.lineTo(r+i,o),t.arcTo(r,o,r,e,i)):t.lineTo(r,o),a?(t.lineTo(r,e+i),t.arcTo(r,e,n,e,i)):t.lineTo(r,e)}(r,n,o,c,l,g,!y&&!x,!y&&!b,!C&&!b,!C&&!x):function(t,r,e,n,o,i,a,u,f,c){a&&(t.moveTo(r+i,e),t.lineTo(r,e),t.lineTo(r,e+i),t.arcTo(r,e,r+i,e,i)),u&&(t.moveTo(n-i,e),t.lineTo(n,e),t.lineTo(n,e+i),t.arcTo(n,e,n-i,e,i)),f&&(t.moveTo(n-i,o),t.lineTo(n,o),t.lineTo(n,o-i),t.arcTo(n,o,n-i,o,i)),c&&(t.moveTo(r+i,o),t.lineTo(r,o),t.lineTo(r,o-i),t.arcTo(r,o,r+i,o,i))}(r,n,o,c,l,g,y&&x&&w,y&&b&&m,C&&b&&k,C&&x&&B)}function n(t,r){var e=h(r.text,r.ecLevel,r.minVersion,r.maxVersion,r.quiet);if(!e)return null;var n=d(t).data("qrcode",e),o=n[0].getContext("2d");return i(e,o,r),function(t,r,e){var n,o,i=t.module_count,a=e.size/i,u=l;for(0<e.radius&&e.radius<=.5&&(u=g),r.beginPath(),n=0;n<i;n+=1)for(o=0;o<i;o+=1)u(t,r,e,e.left+o*a,e.top+n*a,a,n,o);if(c(e.fill)){r.strokeStyle="rgba(0,0,0,0.5)",r.lineWidth=2,r.stroke();var f=r.globalCompositeOperation;r.globalCompositeOperation="destination-out",r.fill(),r.globalCompositeOperation=f,r.clip(),r.drawImage(e.fill,0,0,e.size,e.size),r.restore()}else r.fillStyle=e.fill,r.fill()}(e,o,r),n}function r(t){var r=d("<canvas/>").attr("width",t.size).attr("height",t.size);return n(r,t)}function o(t){return f&&"canvas"===t.render?r(t):f&&"image"===t.render?function(t){return d("<img/>").attr("src",r(t)[0].toDataURL("image/png"))}(t):function(t){var r=h(t.text,t.ecLevel,t.minVersion,t.maxVersion,t.quiet);if(!r)return null;var e,n,o=t.size,i=t.background,a=Math.floor,u=r.module_count,f=a(o/u),c=a(.5*(o-f*u)),l={position:"relative",left:0,top:0,padding:0,margin:0,width:o,height:o},g={position:"absolute",padding:0,margin:0,width:f,height:f,"background-color":t.fill},s=d("<div/>").data("qrcode",r).css(l);for(i&&s.css("background-color",i),e=0;e<u;e+=1)for(n=0;n<u;n+=1)r.is_dark(e,n)&&d("<div/>").css(g).css({left:c+n*f,top:c+e*f}).appendTo(s);return s}(t)}var e,u=t.window,d=u.jQuery,f=!(!(e=u.document.createElement("canvas")).getContext||!e.getContext("2d")),s={render:"canvas",minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:"#fff",text:"no text",radius:0,quiet:0,mode:0,mSize:.1,mPosX:.5,mPosY:.5,label:"no label",fontname:"sans",fontcolor:"#000",image:null};d.fn.qrcode=v.exports=function(t){var e=d.extend({},s,t);return this.each(function(t,r){"canvas"===r.nodeName.toLowerCase()?n(r,e):d(r).append(o(e))})}}).call(this,p(1))},function(t,r){var e;e=function(){return this}();try{e=e||new Function("return this")()}catch(t){"object"==typeof window&&(e=window)}t.exports=e},function(t,r,e){var n,o,i,a=function(){function i(t,r){function a(t,r){l=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(g=4*u+17),e(0,0),e(g-7,0),e(0,g-7),i(),o(),d(t,r),7<=u&&s(t),null==n&&(n=p(u,f,c)),v(n,r)}var u=t,f=w[r],l=null,g=0,n=null,c=[],h={},e=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||g<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||g<=r+n||(l[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},o=function(){for(var t=8;t<g-8;t+=1)null==l[t][6]&&(l[t][6]=t%2==0);for(var r=8;r<g-8;r+=1)null==l[6][r]&&(l[6][r]=r%2==0)},i=function(){for(var t=y.getPatternPosition(u),r=0;r<t.length;r+=1)for(var e=0;e<t.length;e+=1){var n=t[r],o=t[e];if(null==l[n][o])for(var i=-2;i<=2;i+=1)for(var a=-2;a<=2;a+=1)l[n+i][o+a]=-2==i||2==i||-2==a||2==a||0==i&&0==a}},s=function(t){for(var r=y.getBCHTypeNumber(u),e=0;e<18;e+=1){var n=!t&&1==(r>>e&1);l[Math.floor(e/3)][e%3+g-8-3]=n}for(e=0;e<18;e+=1){n=!t&&1==(r>>e&1);l[e%3+g-8-3][Math.floor(e/3)]=n}},d=function(t,r){for(var e=f<<3|r,n=y.getBCHTypeInfo(e),o=0;o<15;o+=1){var i=!t&&1==(n>>o&1);o<6?l[o][8]=i:o<8?l[o+1][8]=i:l[g-15+o][8]=i}for(o=0;o<15;o+=1){i=!t&&1==(n>>o&1);o<8?l[8][g-o-1]=i:o<9?l[8][15-o-1+1]=i:l[8][15-o-1]=i}l[g-8][8]=!t},v=function(t,r){for(var e=-1,n=g-1,o=7,i=0,a=y.getMaskFunction(r),u=g-1;0<u;u-=2)for(6==u&&(u-=1);;){for(var f=0;f<2;f+=1)if(null==l[n][u-f]){var c=!1;i<t.length&&(c=1==(t[i]>>>o&1)),a(n,u-f)&&(c=!c),l[n][u-f]=c,-1==(o-=1)&&(i+=1,o=7)}if((n+=e)<0||g<=n){n-=e,e=-e;break}}},p=function(t,r,e){for(var n=C.getRSBlocks(t,r),o=B(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),y.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,c=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,c),i[u]=new Array(f);for(var l=0;l<i[u].length;l+=1)i[u][l]=255&t.getBuffer()[l+e];e+=f;var g=y.getErrorCorrectPolynomial(c),s=m(i[u],g.getLength()-1).mod(g);for(a[u]=new Array(g.getLength()-1),l=0;l<a[u].length;l+=1){var h=l+s.getLength()-a[u].length;a[u][l]=0<=h?s.getAt(h):0}}var d=0;for(l=0;l<r.length;l+=1)d+=r[l].totalCount;var v=new Array(d),p=0;for(l=0;l<n;l+=1)for(u=0;u<r.length;u+=1)l<i[u].length&&(v[p]=i[u][l],p+=1);for(l=0;l<o;l+=1)for(u=0;u<r.length;u+=1)l<a[u].length&&(v[p]=a[u][l],p+=1);return v}(o,n)};return h.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=x(t);break;case"Alphanumeric":e=T(t);break;case"Byte":e=M(t);break;case"Kanji":e=A(t);break;default:throw"mode:"+r}c.push(e),n=null},h.isDark=function(t,r){if(t<0||g<=t||r<0||g<=r)throw t+","+r;return l[t][r]},h.getModuleCount=function(){return g},h.make=function(){if(u<1){for(var t=1;t<40;t++){for(var r=C.getRSBlocks(t,f),e=B(),n=0;n<c.length;n++){var o=c[n];e.put(o.getMode(),4),e.put(o.getLength(),y.getLengthInBits(o.getMode(),t)),o.write(e)}var i=0;for(n=0;n<r.length;n++)i+=r[n].dataCount;if(e.getLengthInBits()<=8*i)break}u=t}a(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){a(!0,e);var n=y.getLostPoint(h);(0==e||n<t)&&(t=n,r=e)}return r}())},h.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<h.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<h.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=h.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},h.createSvgTag=function(t,r){var e={};"object"==typeof t&&(t=(e=t).cellSize,r=e.margin),t=t||2,r=void 0===r?4*t:r;var n,o,i,a,u=h.getModuleCount()*t+2*r,f="";for(a="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",f+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',f+=e.scalable?"":' width="'+u+'px" height="'+u+'px"',f+=' viewBox="0 0 '+u+" "+u+'" ',f+=' preserveAspectRatio="xMinYMin meet">',f+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',f+='<path d="',o=0;o<h.getModuleCount();o+=1)for(i=o*t+r,n=0;n<h.getModuleCount();n+=1)h.isDark(o,n)&&(f+="M"+(n*t+r)+","+i+a);return f+='" stroke="transparent" fill="black"/>',f+="</svg>"},h.createDataURL=function(o,t){o=o||2,t=void 0===t?4*o:t;var r=h.getModuleCount()*o+2*t,i=t,a=r-t;return L(r,r,function(t,r){if(i<=t&&t<a&&i<=r&&r<a){var e=Math.floor((t-i)/o),n=Math.floor((r-i)/o);return h.isDark(n,e)?0:1}return 1})},h.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=h.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=h.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=e,o+='"'),o+="/>"},h.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*h.getModuleCount()+2*t,u=t,f=a-t,c={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},g="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<f&&u<=r&&r<f&&h.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<f&&u<=r+1&&r+1<f&&h.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",g+=t<1&&f<=r+1?l[i]:c[i];g+="\n"}return a%2&&0<t?g.substring(0,g.length-a-1)+Array(1+a).join("▀"):g.substring(0,g.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=h.getModuleCount()*t+2*r,u=r,f=a-r,c=Array(t+1).join("██"),l=Array(t+1).join("  "),g="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<f&&u<=e&&e<f&&h.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?c:l;for(o=0;o<t;o+=1)g+=s+"\n"}return g.substring(0,g.length-1)},h.renderTo2dContext=function(t,r){r=r||2;for(var e=h.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=h.isDark(n,o)?"black":"white",t.fillRect(n*r,o*r,r,r)},h}i.stringToBytes=(i.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,i.createStringToBytes=function(u,f){var i=function(){function t(){var t=r.read();if(-1==t)throw"eof";return t}for(var r=S(u),e=0,n={};;){var o=r.read();if(-1==o)break;var i=t(),a=t()<<8|t();n[String.fromCharCode(o<<8|i)]=a,e+=1}if(e!=f)throw e+" != "+f;return n}(),a="?".charCodeAt(0);return function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);if(n<128)r.push(n);else{var o=i[t.charAt(e)];"number"==typeof o?(255&o)==o?r.push(o):(r.push(o>>>8),r.push(255&o)):r.push(a)}}return r}};var a=1,u=2,o=4,f=8,w={L:1,M:0,Q:3,H:2},n=0,c=1,l=2,g=3,s=4,h=5,d=6,v=7,y=function(){function e(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r}var r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],t={};return t.getBCHTypeInfo=function(t){for(var r=t<<10;0<=e(r)-e(1335);)r^=1335<<e(r)-e(1335);return 21522^(t<<10|r)},t.getBCHTypeNumber=function(t){for(var r=t<<12;0<=e(r)-e(7973);)r^=7973<<e(r)-e(7973);return t<<12|r},t.getPatternPosition=function(t){return r[t-1]},t.getMaskFunction=function(t){switch(t){case n:return function(t,r){return(t+r)%2==0};case c:return function(t,r){return t%2==0};case l:return function(t,r){return r%3==0};case g:return function(t,r){return(t+r)%3==0};case s:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case h:return function(t,r){return t*r%2+t*r%3==0};case d:return function(t,r){return(t*r%2+t*r%3)%2==0};case v:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},t.getErrorCorrectPolynomial=function(t){for(var r=m([1],0),e=0;e<t;e+=1)r=r.multiply(m([1,p.gexp(e)],0));return r},t.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case o:case f:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case o:return 16;case f:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case o:return 16;case f:return 12;default:throw"mode:"+t}}},t.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);5<i&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var l=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(l+=1);return e+=10*(Math.abs(100*l/r/r-50)/5)},t}(),p=function(){for(var r=new Array(256),e=new Array(256),t=0;t<8;t+=1)r[t]=1<<t;for(t=8;t<256;t+=1)r[t]=r[t-4]^r[t-5]^r[t-6]^r[t-8];for(t=0;t<255;t+=1)e[r[t]]=t;var n={glog:function(t){if(t<1)throw"glog("+t+")";return e[t]},gexp:function(t){for(;t<0;)t+=255;for(;256<=t;)t-=255;return r[t]}};return n}();function m(n,o){if(void 0===n.length)throw n.length+"/"+o;var r=function(){for(var t=0;t<n.length&&0==n[t];)t+=1;for(var r=new Array(n.length-t+o),e=0;e<n.length-t;e+=1)r[e]=n[e+t];return r}(),i={getAt:function(t){return r[t]},getLength:function(){return r.length},multiply:function(t){for(var r=new Array(i.getLength()+t.getLength()-1),e=0;e<i.getLength();e+=1)for(var n=0;n<t.getLength();n+=1)r[e+n]^=p.gexp(p.glog(i.getAt(e))+p.glog(t.getAt(n)));return m(r,0)},mod:function(t){if(i.getLength()-t.getLength()<0)return i;for(var r=p.glog(i.getAt(0))-p.glog(t.getAt(0)),e=new Array(i.getLength()),n=0;n<i.getLength();n+=1)e[n]=i.getAt(n);for(n=0;n<t.getLength();n+=1)e[n]^=p.gexp(p.glog(t.getAt(n))+r);return m(e,0).mod(t)}};return i}function b(){var e=[],o={writeByte:function(t){e.push(255&t)},writeShort:function(t){o.writeByte(t),o.writeByte(t>>>8)},writeBytes:function(t,r,e){r=r||0,e=e||t.length;for(var n=0;n<e;n+=1)o.writeByte(t[n+r])},writeString:function(t){for(var r=0;r<t.length;r+=1)o.writeByte(t.charCodeAt(r))},toByteArray:function(){return e},toString:function(){var t="";t+="[";for(var r=0;r<e.length;r+=1)0<r&&(t+=","),t+=e[r];return t+="]"}};return o}var k,t,C=(k=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],(t={}).getRSBlocks=function(t,r){var e=function(t,r){switch(r){case w.L:return k[4*(t-1)+0];case w.M:return k[4*(t-1)+1];case w.Q:return k[4*(t-1)+2];case w.H:return k[4*(t-1)+3];default:return}}(t,r);if(void 0===e)throw"bad rs block @ typeNumber:"+t+"/errorCorrectionLevel:"+r;for(var n,o,i=e.length/3,a=[],u=0;u<i;u+=1)for(var f=e[3*u+0],c=e[3*u+1],l=e[3*u+2],g=0;g<f;g+=1)a.push((n=l,o=void 0,(o={}).totalCount=c,o.dataCount=n,o));return a},t),B=function(){var e=[],n=0,o={getBuffer:function(){return e},getAt:function(t){var r=Math.floor(t/8);return 1==(e[r]>>>7-t%8&1)},put:function(t,r){for(var e=0;e<r;e+=1)o.putBit(1==(t>>>r-e-1&1))},getLengthInBits:function(){return n},putBit:function(t){var r=Math.floor(n/8);e.length<=r&&e.push(0),t&&(e[r]|=128>>>n%8),n+=1}};return o},x=function(t){var r=a,n=t,e={getMode:function(){return r},getLength:function(t){return n.length},write:function(t){for(var r=n,e=0;e+2<r.length;)t.put(o(r.substring(e,e+3)),10),e+=3;e<r.length&&(r.length-e==1?t.put(o(r.substring(e,e+1)),4):r.length-e==2&&t.put(o(r.substring(e,e+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return e},T=function(t){var r=u,n=t,e={getMode:function(){return r},getLength:function(t){return n.length},write:function(t){for(var r=n,e=0;e+1<r.length;)t.put(45*o(r.charAt(e))+o(r.charAt(e+1)),11),e+=2;e<r.length&&t.put(o(r.charAt(e)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return e},M=function(t){var r=o,e=i.stringToBytes(t),n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=0;r<e.length;r+=1)t.put(e[r],8)}};return n},A=function(t){var r=f,n=i.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(t,r){var e=n("友");if(2!=e.length||38726!=(e[0]<<8|e[1]))throw"sjis not supported."}();var o=n(t),e={getMode:function(){return r},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return e},S=function(t){var e=t,n=0,o=0,i=0,r={read:function(){for(;i<8;){if(n>=e.length){if(0==i)return-1;throw"unexpected end of file./"+i}var t=e.charAt(n);if(n+=1,"="==t)return i=0,-1;t.match(/^\s$/)||(o=o<<6|a(t.charCodeAt(0)),i+=6)}var r=o>>>i-8&255;return i-=8,r}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return r},L=function(t,r,e){for(var n=function(t,r){var n=t,o=r,g=new Array(t*r),e={setPixel:function(t,r,e){g[r*n+t]=e},write:function(t){t.writeString("GIF87a"),t.writeShort(n),t.writeShort(o),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(n),t.writeShort(o),t.writeByte(0);var r=i(2);t.writeByte(2);for(var e=0;255<r.length-e;)t.writeByte(255),t.writeBytes(r,e,255),e+=255;t.writeByte(r.length-e),t.writeBytes(r,e,r.length-e),t.writeByte(0),t.writeString(";")}},i=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,o=s(),i=0;i<r;i+=1)o.add(String.fromCharCode(i));o.add(String.fromCharCode(r)),o.add(String.fromCharCode(e));var a=b(),u=function(t){var e=t,n=0,o=0,r={write:function(t,r){if(t>>>r!=0)throw"length over";for(;8<=n+r;)e.writeByte(255&(t<<n|o)),r-=8-n,t>>>=8-n,n=o=0;o|=t<<n,n+=r},flush:function(){0<n&&e.writeByte(o)}};return r}(a);u.write(r,n);var f=0,c=String.fromCharCode(g[f]);for(f+=1;f<g.length;){var l=String.fromCharCode(g[f]);f+=1,o.contains(c+l)?c+=l:(u.write(o.indexOf(c),n),o.size()<4095&&(o.size()==1<<n&&(n+=1),o.add(c+l)),c=l)}return u.write(o.indexOf(c),n),u.write(e,n),u.flush(),a.toByteArray()},s=function(){var r={},e=0,n={add:function(t){if(n.contains(t))throw"dup key:"+t;r[t]=e,e+=1},size:function(){return e},indexOf:function(t){return r[t]},contains:function(t){return void 0!==r[t]}};return n};return e}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=b();n.write(a);for(var u=function(){function e(t){a+=String.fromCharCode(r(63&t))}var n=0,o=0,i=0,a="",t={},r=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return t.writeByte=function(t){for(n=n<<8|255&t,o+=8,i+=1;6<=o;)e(n>>>o-6),o-=6},t.flush=function(){if(0<o&&(e(n<<6-o),o=n=0),i%3!=0)for(var t=3-i%3,r=0;r<t;r+=1)a+="="},t.toString=function(){return a},t}(),f=a.toByteArray(),c=0;c<f.length;c+=1)u.writeByte(f[c]);return u.flush(),"data:image/gif;base64,"+u};return i}();a.stringToBytesFuncs["UTF-8"]=function(t){return function(t){for(var r=[],e=0;e<t.length;e++){var n=t.charCodeAt(e);n<128?r.push(n):n<2048?r.push(192|n>>6,128|63&n):n<55296||57344<=n?r.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&t.charCodeAt(e)),r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return r}(t)},o=[],void 0===(i="function"==typeof(n=function(){return a})?n.apply(r,o):n)||(t.exports=i)}])});
				}
				$('a[rel=qr]').fancybox({
					padding: 0,
					minWidth: 350,
					minHeight: 350,
					helpers: {
						title: null,
						overlay: {
							locked: false,
							css: {'background': 'rgba(0, 0, 0, 0.4)'}
						}
					},
					wrapCSS: 'apikey-qr-dlg',
					afterLoad: function() {
						var row = $(this.element).closest('div');
						this.content = '<div class="qr-title"><em>App name:</em> <span>' + row.find('.app-name').text() + '</span></div>';
						this.inner.prepend('<div class="qr-body"></div>');
						$('.apikey-qr-dlg').find('.qr-body').html('').qrcode(
							{render: 'image', fill: '#333', radius: 0.5, minVersion: 6, background: null, size: 300, text: row.find('.api-key').text() });
					}
				});
			});
		}
	};
	addQR();
	var generateApiKey = function(){
		var appName$ = $('#app-name');
		appName$.removeClass('warning');
		$('#generate-result').html('&nbsp;').removeClass('dotted-surround');
		$.getJSON(sbRoot + '/config/general/create_apikey', {app_name: appName$.val()},
			function (data) {
				if (undefined === data.error) {
					var appInput$ = $('#app-name');
					if (undefined === data.added) {
						appInput$.addClass('warning');
						$('#generate-result').html(data.result).addClass('dotted-surround');
					} else {
						$('#tip-addkeys').hide();
						var newRow$ = $('#api-keys')
								.append($('.new-key').first().clone(!0))
								.find('.new-key').last().removeClass('new-key');
						newRow$.find('.api-key').text(data.added);
						newRow$.find('.app-name').text(appInput$.val());
						newRow$.find('a').attr('rel', 'qr');
						appInput$.val('');
						newRow$.show();
						addQR();
					}
				} else {
					alert(data.error);
				}
			});
	};
	$('#app-name').keypress(function(ev){
		if (13 === ev.which) {
			ev.preventDefault();
			generateApiKey();
			return !1;
		}
	});
	$('#generate-api-key').on('click', generateApiKey);
	$('.revoke').on('click', function(){
		$('#app-name').removeClass('warning');
		$('#generate-result').html('&nbsp;').removeClass('dotted-surround');
		var row$ = $(this).closest('div'), appName = row$.find('.app-name').text();
		if (confirm('Revoke "' + appName + '" apikey?')) {
			$.getJSON(sbRoot + '/config/general/revoke_apikey', {
					app_name: appName,
					api_key: row$.find('.api-key').text()},
				function (data) {
					if (undefined === data.error) {
						if (undefined === data.removed) {
							$('#app-name').addClass('warning');
							$('#generate-result').html(data.result).addClass('dotted-surround');
						} else {
							row$.remove();
							if (!$('#api-keys').find('div:visible').length) {
								$('#tip-addkeys').show();
							}
						}
					} else {
						alert(data.error);
					}
				}
			);
		}
	});

	$('#branch-checkout').click(function () {
		window.location.href = sbRoot + '/home/branch-checkout?branch=' + $('#branchVersion').val();
	});

	$('#pull-request-checkout').click(function () {
		window.location.href = sbRoot + '/home/pull-request-checkout?branch=' + $('#pullRequestVersion').val();
	});

	fetch_branches();
	fetch_pullrequests();

	$('#showlist_tagview').on('change', function() {
		var selected = '#showlist_tagview_', target = $(selected + 'custom_config');
		target.removeClass('hidden');
		if ('custom' !== $(this).val())
			target.addClass('hidden');
		$(selected + 'standard,' + selected + 'anime,' + selected + 'custom').removeClass('hidden').addClass('hidden');
		$(selected + $(this).val()).removeClass('hidden');
	});
});

function config_success(response) {
	if ('reload' == response) {
		window.location.reload(true);
	} else if ('restart' == response) {
		window.location.href = sbRoot + $('a.restart').attr('href')
	}
	$('.config_submitter').each(function () {
		$(this).removeAttr('disabled');
		$(this).next().remove();
		$(this).show();
	});
	$('#email_show').trigger('notify');

	// update footer only on the config page for the propers option
	if('saveSearch' == $('#configForm').attr('action')){
		getFooterTime({'change_layout': 0});
	}
}

function fetch_pullrequests() {
	$.getJSON(sbRoot + '/config/general/fetch-pullrequests', function (data) {
		$('#pullRequestVersion').find('option').remove();
		if (data['result'] == 'success') {
			var pulls = [];
			$.each(data['pulls'], function (i, pull) {
				if (pull[0] != '') {
					pulls.push(pull);
				}
			});
			if (pulls.length > 0) {
				$.each(pulls, function (i, text) {
					add_option_to_pulls(text);
				});
				$('#pull-request-checkout').removeAttr('disabled');
			} else {
				add_option_to_pulls(['No pull requests available', '']);
			}
		} else {
			add_option_to_pulls(['Failed to connect to github', '']);
		}
	});
}

function fetch_branches() {
	$.getJSON(sbRoot + '/config/general/fetch-branches', function (data) {
		$('#branchVersion').find('option').remove();
		if (data['result'] == 'success') {
			var branches = [];
			$.each(data['branches'], function (i, branch) {
				if (branch != '') {
					branches.push(branch);
				}
			});
			if (branches.length > 0) {
				$.each(branches, function (i, text) {
					add_option_to_branches(text);
				});
				$('#branch-checkout').removeAttr('disabled');
				$('#branchVersion').find('option[value="' + data['current'] + '"]').prop('selected', !0);
			} else {
				add_option_to_branches('No branches available');
			}
		} else {
			add_option_to_branches('Failed to connect to github');
		}
	});
}

function add_option_to_pulls(text) {
	var option = $('<option>');
	option.val(text[1]);
	option.html(text[0]);
	option.appendTo('#pullRequestVersion');
}

function add_option_to_branches(text) {
	var option = $('<option>');
	option.val(text);
	option.html(text);
	option.appendTo('#branchVersion');
}
