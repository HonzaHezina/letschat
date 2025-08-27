<?php
	$page = 'page-left-image';

	$header = '';
	$footer = '';

	$body = '';
	$menu = 'login';
	
	ob_start(); require 'template/header.html.php'; $header = ob_get_contents(); ob_end_clean();

	$content = '';
	
	ob_start(); require 'template/login.html.php'; $content .= ob_get_contents(); ob_end_clean();

	require 'template/master.html.php';
?>