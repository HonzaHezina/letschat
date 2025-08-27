$(window).on('load', function()
{
	$('*[data-background]').each(function()
	{
		$(this).css('background-image', 'url("' + $(this).attr('data-background') + '")');
	});
});

$(document).ready(function()
{
	$('.disabled').on('click', function(event)
	{
		event.preventDefault();
	});

	$('.scroll').on('click', function(event)
	{
		event.preventDefault();

		scrollTo($(this).attr('href'), 100);
	});

	$('#menu-burger').on('click', function(event)
	{
		event.preventDefault();

		$('#menu-box').fadeIn();
	});

	$('#menu-box a.close').on('click', function(event)
	{
		event.preventDefault();

		$('#menu-box').hide();
	});

	$('.page.leftright .left .show').on('click', function(event)
	{
		event.preventDefault();

		$('.page.leftright .left').toggleClass('active');
	});

	$('.input .visible').on('click', function(event)
	{
		event.preventDefault();

		var input = $(this).attr('data-input');

		if (typeof input === 'string')
		{
			$('input[name=' + input + ']').get(0).type = $('input[name=' + input + ']').get(0).type === 'password' ? 'text' : 'password';
			$('input[name=' + input + ']').next('.visible').toggleClass('active');
		}
	});

	$('.chats .item .action a').on('click', function(event)
	{
		event.preventDefault();

		var id = parseInt($(this).attr('data-id'));
		var box = $(this).attr('data-box');

		if (typeof id === 'number' && typeof box === 'string')
		{
			if ($('#chats-item-' + id + ' .box.' + box).hasClass('open'))
			{
				$('#chats-item-' + id + ' .box.' + box).removeClass('open').hide();
			}
			else
			{
				$('#chats-item-' + id + ' .box').removeClass('open').hide();
				$('#chats-item-' + id + ' .box.' + box).addClass('open').fadeIn();
			}
		}
	});

	$('.chats .item .box.delete .confirm').on('click', function(event)
	{
		event.preventDefault();
	});

	if ($('.chat .messages > .bubbles').length)
	{
		$('.chat .messages > .bubbles').scrollTop($('.chat .messages > .bubbles')[0].scrollHeight);
	}

	$('.chat .title a.settings').on('click', function(event)
	{
		event.preventDefault();

		$('.chat .title a.settings').toggleClass('active');
		$('.chat .title ul.settings').fadeToggle();
	});

	$(document).on('submit', '.chats .item .box.edit .form', function(event)
	{
		event.preventDefault();

		var id = parseInt($(this).attr('data-id'));

		if (typeof id === 'number')
		{
		}
	});

	$(document).on('submit', '#form-code', function(event)
	{
		event.preventDefault();

		$('#form-code input[type=text]').focus();
		$('#form-code-error').fadeIn();
	});

	$(document).on('submit', '#form-registration', function(event)
	{
		event.preventDefault();

		$('.form .error').fadeIn();
	});

	$(document).on('submit', '#form-login', function(event)
	{
		event.preventDefault();

		$('.form .error').fadeIn();
	});

	$(document).on('submit', '#form-profile', function(event)
	{
		event.preventDefault();

		$('.form .error').fadeIn();
	});

	$(document).on('submit', '#form-chat-message', function(event)
	{
		event.preventDefault();
	});

	$.datepicker.regional['cz'] =
	{
		closeText: 'Zavřít',
		prevText: 'Předchozí měsíc',
		nextText: 'Další měsíc',
		monthNames: [ 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec' ],
		monthNamesShort: [ 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec' ],
		dayNames: [ 'Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota' ],
		dayNamesShort: [ 'Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So' ],
		dayNamesMin: [ 'Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So' ],
	};

	$.datepicker.setDefaults($.datepicker.regional['cz']);

	let maxDate = new Date();

	$('.datepicker').datepicker($.extend({},
	{
		firstDay: 1,
		dateFormat: 'dd. mm. yy',
		maxDate: new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()),
		changeMonth: false,
		changeYear: false
	}));
});

var scrollTo = function(selector, offset)
{
	if ($(selector).length)
	{
		$('html, body').animate(
		{
			scrollTop: $(selector).offset().top - offset
		}, 1000);
	}
}