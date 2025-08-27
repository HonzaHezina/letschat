<?php
	$page = 'page-full';

	$header = '';
	$footer = '';

	$body = '';
	$menu = 'chats';

	ob_start(); require 'template/header-logged.html.php'; $header = ob_get_contents(); ob_end_clean();

	$content = '';

	ob_start(); require 'template/chats.html.php'; $content .= ob_get_contents(); ob_end_clean();

	require 'template/master.html.php';
?>